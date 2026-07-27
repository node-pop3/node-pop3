import {Readable} from 'stream';
import {createServer} from 'net';

import {expect} from 'chai';

import Pop3Connection from '../src/Connection.js';
import Pop3Command from '../src/Command.js';
import {stream2String} from '../src/helper.js';

/**
 * @param {string} str
 * @returns {Readable}
 */
function makeStream (str) {
  return Readable.from([Buffer.from(str)]);
}

describe('stream2String dot-unstuffing', function () {
  it(
    'removes extra leading dot on first line starting with ".."',
    async function () {
      const result = await stream2String(
        makeStream('..com/example\r\nsome text')
      );
      expect(result).to.equal('.com/example\r\nsome text');
    }
  );

  it(
    'removes extra leading dot on a mid-message line starting with ".."',
    async function () {
      const result = await stream2String(
        makeStream('first line\r\n..stuffed line\r\nnormal line')
      );
      expect(result).to.equal('first line\r\n.stuffed line\r\nnormal line');
    }
  );

  it('handles multiple dot-stuffed lines', async function () {
    const result = await stream2String(
      makeStream('first\r\n..one\r\n..two\r\nnormal')
    );
    expect(result).to.equal('first\r\n.one\r\n.two\r\nnormal');
  });

  it(
    'handles dot-stuffed first line and mid-message line together',
    async function () {
      const result = await stream2String(
        makeStream('..first\r\nnormal\r\n..second')
      );
      expect(result).to.equal('.first\r\nnormal\r\n.second');
    }
  );

  it(
    'leaves normal content without dot-stuffing unchanged',
    async function () {
      const result = await stream2String(
        makeStream('normal content\r\nno dot stuffing')
      );
      expect(result).to.equal('normal content\r\nno dot stuffing');
    }
  );

  it(
    'leaves a line starting with a single "." unchanged',
    async function () {
      const result = await stream2String(
        makeStream('first line\r\n.single dot\r\nnormal')
      );
      expect(result).to.equal('first line\r\n.single dot\r\nnormal');
    }
  );

  it('handles an empty buffer', async function () {
    const result = await stream2String(makeStream(''));
    expect(result).to.equal('');
  });
});

describe('Connection socket lifecycle checks', function () {
  it(
    'rejects with no-socket if socket has already been destroyed',
    async function () {
      const connection = new Pop3Connection({host: 'example.test'});
      let writeCalled = false;
      // @ts-expect-error Testing invalid socket state
      connection._socket = {
        destroyed: true,
        writable: false,
        writableEnded: true,
        write () {
          writeCalled = true;
          return true;
        }
      };

      try {
        await connection.command('NOOP');
        expect.fail('Expected command to reject with no-socket');
      } catch (err) {
        expect(/** @type {Error} */ (err).message).to.equal('no-socket');
      }

      expect(writeCalled).to.equal(false);
    }
  );
});

describe('Connection split response handling', function () {
  it(
    'handles +OK and CRLF arriving in separate chunks for UIDL',
    async function () {
      this.timeout(5000);

      const server = createServer((socket) => {
        socket.write('+OK pop3 test server ready\r\n');
        socket.on('data', (_buffer) => {
          const command = _buffer.toString('utf8').trim();
          if (command.startsWith('USER ')) {
            socket.write('+OK user accepted\r\n');
            return;
          }
          if (command.startsWith('PASS ')) {
            socket.write('+OK pass accepted\r\n');
            return;
          }
          if (command === 'UIDL') {
            socket.write('+OK');
            setTimeout(() => socket.write('\r\n'), 5);
            setTimeout(() => socket.write('1 first-id\r\n'), 10);
            setTimeout(() => socket.write('2 second-id\r\n'), 15);
            setTimeout(() => socket.write('.'), 20);
            return;
          }
          if (command === 'QUIT') {
            socket.write('+OK bye\r\n');
            socket.end();
          }
        });
      });

      // eslint-disable-next-line promise/avoid-new -- Wrapping callback API
      await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          resolve(undefined);
        });
      });

      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        throw new TypeError('Could not get test server address');
      }

      const pop3Command = new Pop3Command({
        host: '127.0.0.1',
        port: address.port,
        user: 'user',
        password: 'pass'
      });

      try {
        const list = await pop3Command.UIDL();
        expect(list).to.deep.equal([
          ['1', 'first-id'],
          ['2', 'second-id']
        ]);
        await pop3Command.QUIT();
      } finally {
        // eslint-disable-next-line promise/avoid-new -- Wrapping callback API
        await new Promise((resolve) => {
          server.close(resolve);
        });
      }
    }
  );
});
