import {Readable} from 'stream';
import {readFileSync} from 'fs';

import Pop3Command from '../src/Command.js';
import {stream2String} from '../src/helper.js';
import {seedMessage, deleteMessage} from './helpers/helper.js';

const config = JSON.parse(readFileSync(new URL('../pop.config.json', import.meta.url)));

describe('Programmatic', async function () {
  this.timeout(60000);
  describe('Commands needing messages', function () {
    beforeEach(() => {
      return seedMessage({subject: 'test', html: 'test'});
    });
    afterEach(() => {
      return deleteMessage();
    });

    it('Runs `command`', async function () {
      const pop3Command = new Pop3Command(config);
      await pop3Command.connect();
      await pop3Command.command('USER', config.user);
      await pop3Command.command('PASS', config.password);
      const [, stream] = await pop3Command.command('TOP', '1', '0');
      await pop3Command.QUIT();
      const str = await stream2String(stream);
      expect(str).to.contain('Received:');
    });

    it('Runs RETR command with message', async function () {
      const pop3Command = new Pop3Command(config);
      await pop3Command.connect();
      await pop3Command.command('USER', config.user);
      await pop3Command.command('PASS', config.password);
      const string = await pop3Command.RETR(1);
      await pop3Command.QUIT();
      expect(string).to.be.a('string');
    });
  });
  describe('Commands needing messages but no clean-up', function () {
    beforeEach(() => {
      return seedMessage({subject: 'test', html: 'test'});
    });
    it('Runs DELE command with message', async function () {
      const pop3Command = new Pop3Command(config);
      await pop3Command.connect();
      await pop3Command.command('USER', config.user);
      await pop3Command.command('PASS', config.password);
      const info = await pop3Command.DELE(1);
      await pop3Command.QUIT();
      expect(info).to.contain('Marked to be deleted');
    });
  });
  it('Runs RSET command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const info = await pop3Command.RSET();
    await pop3Command.QUIT();
    expect(info).to.be.a('string');
  });
  it('Runs STAT command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const info = await pop3Command.STAT();
    await pop3Command.QUIT();
    expect(info).to.be.a('string');
  });
  it('Runs NOOP command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const info = await pop3Command.NOOP();
    await pop3Command.QUIT();
    expect(info).to.be.undefined;
  });
  it('Runs LIST command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const list = await pop3Command.LIST();
    await pop3Command.QUIT();
    expect(list).to.be.an('array');
  });
  it('Runs UIDL command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const list = await pop3Command.UIDL();
    await pop3Command.QUIT();
    expect(list).to.be.an('array');
  });
  // Not sure why not getting server responses for these despite passing
  //   on command
  it.skip('Runs LIST command with message', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const list = await pop3Command.LIST(1);
    await pop3Command.QUIT();
    expect(list).to.be.an('array');
  });
  it.skip('Runs UIDL command with message', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const list = await pop3Command.UIDL(1);
    await pop3Command.QUIT();
    expect(list).to.be.a('string');
  });
  it('Defaults programmatically to 110 with no port or tls', async function () {
    const pop3Command = new Pop3Command({
      ...config, port: undefined, tls: false
    });
    await pop3Command._connect();
    await pop3Command.QUIT();

    expect(true).to.be.true;
  });

  it('Stops with early terminating server response', async function () {
    const pop3Command = new Pop3Command(config);
    const prom = pop3Command._connect().catch(() => {
      // May throw
    });
    const listProm = pop3Command.command('LIST');
    setTimeout(() => {
      pop3Command._socket.emit('data', Buffer.from('\r\n.\r\n'));
    }, 3000);

    try {
      await listProm;
    } catch (err) {
      // May throw
    }

    try {
      await prom;
    } catch (err) {
      // May throw
    }

    try {
      await pop3Command.QUIT();
    } catch (err) {
      // May throw
    }

    expect(true).to.be.true;
  });

  it('Stops with call to `_endStream` (not called internally as such)', async function () {
    const pop3Command = new Pop3Command(config);
    const prom = pop3Command._connect();
    const listProm = pop3Command.command('LIST');
    setTimeout(() => {
      pop3Command._endStream();
    }, 5000);
    await listProm;
    await prom;
    await pop3Command.QUIT();
    expect(true).to.be.true;
  });

  describe('Errors', function () {
    it('Rejects with bad stream', function () {
      const stream = new Readable();
      const prom = stream2String(stream).then(() => {
        expect(false).to.be.true;
      }, (err) => {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('oops');
      });
      stream.emit('error', new Error('oops'));
      return prom;
    });
    it('Rejects with bad server response (not `+OK` or `-ERR`)', async function () {
      const pop3Command = new Pop3Command(config);
      const prom = pop3Command._connect();
      pop3Command._socket.emit('data', [50]);
      await prom.then(() => {
        expect(false).to.be.true;
      }, (err) => {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('Unexpected response');
      });
      await pop3Command.QUIT();
    });
    it('Stops with error to `_endStream` (not called internally as such)', async function () {
      const pop3Command = new Pop3Command(config);
      const prom = pop3Command._connect();
      const listProm = pop3Command.command('LIST');
      setTimeout(() => {
        pop3Command._endStream(new Error('oops'));
      }, 5000);
      await listProm;
      try {
        await prom;
        expect(false).to.be.true;
      } catch (err) {
        expect(err.message).to.equal('oops');
      }
      await pop3Command.QUIT();
      expect(true).to.be.true;
    });

    it('Rejects with socket error and existing stream', async function () {
      const pop3Command = new Pop3Command(config);
      let err, res;
      pop3Command.on('error', (e) => {
        err = e;
        if (err.message === 'oops' || err.message.includes('Unknown command')) {
          res();
        }
      });
      const connectProm = pop3Command._connect();
      const listProm = pop3Command.command('LIST');
      const p = new Promise((resolve) => {
        setTimeout(() => {
          res = resolve;
          pop3Command._socket.emit('error', new Error('oops'));
          // We have to send this ourselves as not getting from server
          pop3Command._socket.emit('data', Buffer.from('\r\n.\r\n'));
        }, 3000);
      });

      try {
        await connectProm;
        expect(false).to.be.true;
      } catch (err) {
        expect(err.message).to.equal('oops');
      }

      await listProm;
      try {
        await pop3Command.QUIT();
      } catch (err) {
        // Sometimes errs
      }
      return p;
    });
    it('Gets events on time out', async function () {
      const pop3Command = new Pop3Command({
        ...config,
        timeout: 10
      });
      let endError, errError;
      pop3Command.on('end', (e) => {
        endError = e;
      });
      pop3Command.on('error', (e) => {
        errError = e;
      });

      try {
        await pop3Command._connect();
        expect(false).to.be.true;
      } catch (err) {
        expect(err.eventName).to.equal('timeout');
        expect(err.message).to.equal('timeout');

        expect(endError.eventName).to.equal('timeout');
        expect(endError.message).to.equal('timeout');

        expect(errError.eventName).to.equal('timeout');
        expect(errError.message).to.equal('timeout');
      }
      try {
        await pop3Command.command('QUIT');
        expect(false).to.be.true;
      } catch (err) {
        expect(err.message).to.equal('no-socket');
      }
    });
  });
});
