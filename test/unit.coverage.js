// @ts-nocheck
/* eslint-disable require-await, @stylistic/max-len,
    promise/avoid-new, no-promise-executor-return,
    jsdoc/reject-any-type -- Coverage-focused tests use
    concise stubs and callback wrappers for branch control. */
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

describe('Pop3Command branch coverage', function () {
  /** @type {Pop3Connection['connect']} */
  let originalConnect;
  /** @type {Pop3Connection['command']} */
  let originalCommand;

  beforeEach(function () {
    originalConnect = Pop3Connection.prototype.connect;
    originalCommand = Pop3Connection.prototype.command;
  });

  afterEach(function () {
    Pop3Connection.prototype.connect = originalConnect;
    Pop3Connection.prototype.command = originalCommand;
  });

  /**
   * @param {Partial<ConstructorParameters<typeof Pop3Command>[0]>} [cfg]
   * @returns {Pop3Command}
   */
  function makeCommand (cfg = {}) {
    return new Pop3Command({
      user: 'user',
      password: 'pass',
      host: 'example.test',
      ...cfg
    });
  }

  it('returns stream directly when parseStreamToString is false', async function () {
    const pop3Command = makeCommand({parseStreamToString: false});
    const stream = Readable.from(['body']);

    const result = pop3Command._parseMailStream(stream);

    expect(result).to.equal(stream);
  });

  it('reuses cached PASS info when already connected', async function () {
    const pop3Command = makeCommand();
    // @ts-expect-error Test doubles for socket state
    pop3Command._socket = {writable: true};
    pop3Command._PASSInfo = 'cached pass info';

    Pop3Connection.prototype.connect = async function () {
      throw new Error('connect should not be called');
    };
    Pop3Connection.prototype.command = async function () {
      throw new Error('command should not be called');
    };

    const info = await pop3Command._connect();
    expect(info).to.equal('cached pass info');
  });

  it('returns parsed single-line response for UIDL and LIST with message number', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'UIDL') {
        return ['1 unique-id', null];
      }
      if (commandName === 'LIST') {
        return ['1 42', null];
      }
      return ['ok', null];
    };

    const uidl = await pop3Command.UIDL(1);
    const list = await pop3Command.LIST(1);

    expect(uidl).to.deep.equal(['1', 'unique-id']);
    expect(list).to.deep.equal(['1', '42']);
  });

  it('parses LIST multi-line stream when no message number is provided', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'LIST') {
        return ['ok', Readable.from([Buffer.from('1 10\r\n2 20\r\n')])];
      }
      return ['ok', null];
    };

    const list = await pop3Command.LIST();
    expect(list).to.deep.equal([['1', '10'], ['2', '20']]);
  });

  it('covers RSET, DELE, and STAT info-returning command paths', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'RSET') {
        return ['reset ok', null];
      }
      if (commandName === 'DELE') {
        return ['delete ok', null];
      }
      if (commandName === 'STAT') {
        return ['2 320', null];
      }
      return ['ok', null];
    };

    expect(await pop3Command.RSET()).to.equal('reset ok');
    expect(await pop3Command.DELE(1)).to.equal('delete ok');
    expect(await pop3Command.STAT()).to.equal('2 320');
  });

  it('runs NOOP command path', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'NOOP') {
        return ['ok', null];
      }
      return ['ok', null];
    };

    const result = await pop3Command.NOOP();
    expect(result).to.be.undefined;
  });

  it('returns LAST error message when server says it is not enabled', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'LAST') {
        throw new Error('LAST command not enabled on this server');
      }
      return ['ok', null];
    };

    const info = await pop3Command.LAST();
    expect(info).to.equal('LAST command not enabled on this server');
  });

  it('returns successful LAST response text', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'LAST') {
        return ['3', null];
      }
      return ['ok', null];
    };

    const info = await pop3Command.LAST();
    expect(info).to.equal('3');
  });

  it('rethrows LAST errors that are unrelated to disabled-LAST responses', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'LAST') {
        throw new TypeError('other failure');
      }
      return ['ok', null];
    };

    try {
      await pop3Command.LAST();
      expect.fail('Expected LAST to throw');
    } catch (err) {
      expect(err).to.be.instanceOf(TypeError);
      expect(/** @type {Error} */ (err).message).to.equal('other failure');
    }
  });

  it('returns stream directly from TOP when configured not to parse streams', async function () {
    const pop3Command = makeCommand({parseStreamToString: false});
    const stream = Readable.from(['header\r\nbody']);

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'TOP') {
        return ['ok', stream];
      }
      return ['ok', null];
    };

    const result = await pop3Command.TOP(1, 0);
    expect(result).to.equal(stream);
  });

  it('parses CAPA stream into a capability map', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'CAPA') {
        return [
          'ok',
          Readable.from([
            Buffer.from(
              'SASL PLAIN LOGIN\r\n PIPELINING\r\nRESP-CODES\r\n'
            )
          ])
        ];
      }
      return ['ok', null];
    };

    const capabilities = await pop3Command.CAPA();
    expect(capabilities).to.deep.equal({
      SASL: ['PLAIN', 'LOGIN'],
      'RESP-CODES': []
    });
  });

  it('supports uses normalized names and cached capabilities', async function () {
    const pop3Command = makeCommand();
    let capaCallCount = 0;

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'CAPA') {
        capaCallCount++;
        return [
          'ok',
          Readable.from([
            Buffer.from('STLS\r\nIMPLEMENTATION node-pop3\r\n')
          ])
        ];
      }
      return ['ok', null];
    };

    const hasStls = await pop3Command.supports(' stls ');
    const hasImplementation = await pop3Command.supports('IMPLEMENTATION');
    const hasAuth = await pop3Command.supports('AUTH');

    expect(hasStls).to.equal(true);
    expect(hasImplementation).to.equal(true);
    expect(hasAuth).to.equal(false);
    expect(capaCallCount).to.equal(1);
  });

  it('supports returns false for an empty capability name', async function () {
    const pop3Command = makeCommand();

    Pop3Connection.prototype.connect = async function () {
      throw new Error('connect should not be called');
    };
    Pop3Connection.prototype.command = async function () {
      throw new Error('command should not be called');
    };

    const supported = await pop3Command.supports('  ');
    expect(supported).to.equal(false);
  });

  it('parses RETR stream to string when parseStreamToString is enabled', async function () {
    const pop3Command = makeCommand({parseStreamToString: true});

    Pop3Connection.prototype.connect = async function () {
      return undefined;
    };

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'USER') {
        return ['ok', null];
      }
      if (commandName === 'PASS') {
        return ['auth ok', null];
      }
      if (commandName === 'RETR') {
        return ['ok', Readable.from([Buffer.from('mail body')])];
      }
      return ['ok', null];
    };

    const result = await pop3Command.RETR(1);
    expect(result).to.equal('mail body');
  });

  it('returns Bye for QUIT when there is no active socket', async function () {
    const pop3Command = makeCommand();
    pop3Command._capabilities = {SASL: ['PLAIN']};

    const info = await pop3Command.QUIT();
    expect(info).to.equal('Bye');
    expect(pop3Command._capabilities).to.be.null;
  });

  it('stores an empty string if QUIT returns no info text', async function () {
    const pop3Command = makeCommand();
    // @ts-expect-error Test doubles for socket state
    pop3Command._socket = {destroyed: false, writable: true, writableEnded: false};
    pop3Command._capabilities = {PIPELINING: []};

    Pop3Connection.prototype.command = async function (commandName) {
      if (commandName === 'QUIT') {
        return ['', null];
      }
      return ['ok', null];
    };

    const info = await pop3Command.QUIT();
    expect(info).to.equal('');
    expect(pop3Command._PASSInfo).to.equal('');
    expect(pop3Command._capabilities).to.be.null;
  });
});

describe('Connection command branch coverage', function () {
  /**
   * @returns {Pop3Connection & {_socket: {write: (data: string, enc: string) => void}}}
   */
  function makeConnection () {
    const connection = new Pop3Connection({host: 'example.test'});
    // @ts-expect-error Test doubles for socket state
    connection._socket = {
      destroyed: false,
      writable: true,
      writableEnded: false,
      write () {
        // Replaced per-test.
      }
    };
    return /** @type {any} */ (connection);
  }

  it('waits for pending stream end before writing a new command', async function () {
    const connection = makeConnection();
    connection._stream = /** @type {any} */ ({});

    connection._socket.write = function () {
      const responseListener = connection.listeners('response')[0];
      responseListener('ok', null);
    };

    const prom = connection.command('NOOP');
    connection._stream = null;
    connection.emit('end');
    const result = await prom;

    expect(result).to.deep.equal(['ok', null]);
  });

  it('rejects if pending stream ends with an error', async function () {
    const connection = makeConnection();
    connection._stream = /** @type {any} */ ({});

    const prom = connection.command('NOOP');
    connection.emit('end', new Error('stream end failure'));

    try {
      await prom;
      expect.fail('Expected command to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('stream end failure');
    }
  });

  it('rejects if pending stream emits an error before completion', async function () {
    const connection = makeConnection();
    connection._stream = /** @type {any} */ ({});

    const prom = connection.command('NOOP');
    connection.emit('error', new Error('stream error before write'));

    try {
      await prom;
      expect.fail('Expected command to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('stream error before write');
    }
  });

  it('rejects if socket is no longer active right before write', async function () {
    const connection = makeConnection();
    let checks = 0;
    connection._hasActiveSocket = () => {
      checks++;
      return checks === 1;
    };

    try {
      await connection.command('NOOP');
      expect.fail('Expected command to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('no-socket');
    }
  });

  it('rejects when socket.write throws', async function () {
    const connection = makeConnection();
    connection._socket.write = function () {
      throw new Error('write failed');
    };

    try {
      await connection.command('NOOP');
      expect.fail('Expected command to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('write failed');
    }
  });

  it('ignores duplicate error/reject callbacks once settled', async function () {
    const connection = makeConnection();
    connection._socket.write = function () {
      const errorListener = connection.listeners('error')[0];
      errorListener(new Error('first error'));
      errorListener(new Error('second error'));
    };

    try {
      await connection.command('NOOP');
      expect.fail('Expected command to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('first error');
    }
  });

  it('ignores duplicate response callbacks once settled', async function () {
    const connection = makeConnection();
    connection._socket.write = function () {
      const responseListener = connection.listeners('response')[0];
      responseListener('ok', null);
      responseListener('ignored', null);
    };

    const result = await connection.command('NOOP');
    expect(result).to.deep.equal(['ok', null]);
  });
});

describe('Connection connect branch coverage', function () {
  it('treats unexpected greeting as bad-server-response', async function () {
    const server = createServer((socket) => {
      socket.write('2 bad greeting\r\n');
      socket.end();
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      expect.fail('Expected connect() to reject');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('Unexpected response');
      expect(/** @type {{eventName?: string}} */ (err).eventName).to.equal(
        'bad-server-response'
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('pushes LIST body data that arrives with +OK in the same chunk', async function () {
    /** @type {import('net').Socket|undefined} */
    let serverSocket;
    const server = createServer((socket) => {
      serverSocket = socket;
      socket.write('+OK ready\r\n');
      socket.on('data', (buffer) => {
        const command = buffer.toString('utf8').trim();
        if (command === 'LIST') {
          socket.write('+OK list follows\r\n1 20\r\n.\r\n');
          return;
        }
        if (command === 'QUIT') {
          socket.write('+OK bye\r\n');
          socket.end();
        }
      });
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      const [, stream] = await connection.command('LIST');
      const body = await stream2String(
        /** @type {import('stream').Readable} */ (stream)
      );
      expect(body).to.equal('1 20');
      await connection.command('QUIT');
    } finally {
      if (connection._socket) {
        /** @type {import('net').Socket} */ (connection._socket).destroy();
      }
      if (serverSocket && !serverSocket.destroyed) {
        serverSocket.destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('emits connection error while streaming without nulling socket', async function () {
    const server = createServer((socket) => {
      socket.write('+OK ready\r\n');
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      connection._stream = /** @type {any} */ ({});

      const errorProm = new Promise((resolve) => {
        connection.once('error', (err) => {
          resolve(err);
        });
      });

      /** @type {import('net').Socket} */ (connection._socket).emit(
        'error',
        new Error('streaming socket error')
      );

      const err = await errorProm;
      expect(/** @type {Error} */ (err).message).to.equal('streaming socket error');
      expect(connection._socket).to.not.be.null;
    } finally {
      if (connection._socket) {
        /** @type {import('net').Socket} */ (connection._socket).destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('nulls socket when low-level socket error occurs outside stream mode', async function () {
    /** @type {import('net').Socket|undefined} */
    let serverSocket;
    const server = createServer((socket) => {
      serverSocket = socket;
      socket.write('+OK ready\r\n');
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      connection._stream = null;

      const priorSocket = /** @type {import('net').Socket} */ (connection._socket);

      /** @type {import('net').Socket} */ (connection._socket).emit(
        'error',
        new Error('socket error no stream')
      );

      expect(connection._socket).to.be.null;
      priorSocket.destroy();
    } finally {
      if (serverSocket && !serverSocket.destroyed) {
        serverSocket.destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('destroys active stream when socket timeout fires', async function () {
    /** @type {import('net').Socket|undefined} */
    let serverSocket;
    const server = createServer((socket) => {
      serverSocket = socket;
      socket.write('+OK ready\r\n');
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port,
      timeout: 20
    });

    let destroyed = false;

    try {
      await connection.connect();
      connection._stream = /** @type {any} */ ({
        destroy () {
          destroyed = true;
        },
        push () {
          // Not used here.
        }
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      expect(destroyed).to.equal(true);
    } finally {
      if (connection._socket) {
        /** @type {import('net').Socket} */ (connection._socket).destroy();
      }
      if (serverSocket && !serverSocket.destroyed) {
        serverSocket.destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('masks PASS command in emitted server error metadata', async function () {
    /** @type {import('net').Socket|undefined} */
    let serverSocket;
    const server = createServer((socket) => {
      serverSocket = socket;
      socket.write('+OK ready\r\n');
      socket.on('data', () => {
        socket.write('-ERR auth failed\r\n');
      });
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      try {
        await connection.command('PASS', 'secret');
        expect.fail('Expected PASS to reject');
      } catch (err) {
        expect(/** @type {Error} */ (err).message).to.equal('auth failed');
        expect(/** @type {{command?: string}} */ (err).command).to.equal(
          'PASS ***'
        );
      }
    } finally {
      if (connection._socket) {
        /** @type {import('net').Socket} */ (connection._socket).destroy();
      }
      if (serverSocket && !serverSocket.destroyed) {
        serverSocket.destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('keeps non-PASS command text in emitted server error metadata', async function () {
    /** @type {import('net').Socket|undefined} */
    let serverSocket;
    const server = createServer((socket) => {
      serverSocket = socket;
      socket.write('+OK ready\r\n');
      socket.on('data', () => {
        socket.write('-ERR no such command\r\n');
      });
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve(undefined);
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      await new Promise((resolve) => server.close(resolve));
      throw new TypeError('Could not get test server address');
    }

    const connection = new Pop3Connection({
      host: '127.0.0.1',
      port: address.port
    });

    try {
      await connection.connect();
      try {
        await connection.command('STAT');
        expect.fail('Expected STAT to reject');
      } catch (err) {
        expect(/** @type {Error} */ (err).message).to.equal('no such command');
        expect(/** @type {{command?: string}} */ (err).command).to.equal('STAT');
      }
    } finally {
      if (connection._socket) {
        /** @type {import('net').Socket} */ (connection._socket).destroy();
      }
      if (serverSocket && !serverSocket.destroyed) {
        serverSocket.destroy();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

describe('stream2String option and settlement branches', function () {
  it('supports numeric maxBytes option form', async function () {
    try {
      await stream2String(makeStream('1234'), 3);
      expect.fail('Expected numeric maxBytes to enforce limits');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('mailSizeExceeded');
    }
  });

  it('ignores invalid numeric and object option values', async function () {
    expect(await stream2String(makeStream('1234'), 0)).to.equal('1234');
    expect(
      await stream2String(makeStream('abcd'), {
        maxBytes: Infinity,
        timeoutMs: 0
      })
    ).to.equal('abcd');
  });

  it('uses Buffer.from for string chunks', async function () {
    const stream = new Readable({
      read () {
        // Driven by explicit emits.
      }
    });

    const prom = stream2String(stream);
    stream.emit('data', 'alpha');
    stream.emit('end');

    const str = await prom;
    expect(str).to.equal('alpha');
  });

  it('ignores end event after already rejecting', async function () {
    const stream = new Readable({
      read () {
        // Driven by explicit emits.
      }
    });

    const prom = stream2String(stream);
    stream.emit('error', new Error('boom'));
    stream.emit('end');

    try {
      await prom;
      expect.fail('Expected rejection');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('boom');
    }
  });

  it('ignores duplicate fail and end callbacks after settlement', async function () {
    const stream = new Readable({
      read () {
        // Driven by explicit listener invocation.
      }
    });

    const prom = stream2String(stream);
    const errorListener = stream.listeners('error')[0];
    const endListener = stream.listeners('end')[0];

    errorListener(new Error('first failure'));
    errorListener(new Error('second failure'));
    endListener();

    try {
      await prom;
      expect.fail('Expected rejection');
    } catch (err) {
      expect(/** @type {Error} */ (err).message).to.equal('first failure');
    }
  });

  it('covers dot-unstuffing with first-line-only and mid-line patterns', async function () {
    expect(await stream2String(makeStream('..only'))).to.equal('.only');
    expect(await stream2String(makeStream('a\r\n..b\r\nc'))).to.equal('a\r\n.b\r\nc');
  });
});
