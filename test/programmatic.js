import 'regenerator-runtime/runtime.js';

import {Readable} from 'stream';

import Pop3Command from '../lib/Command.js';
import {stream2String} from '../lib/helper.js';

import config from '../pop.config.json';

describe('Programmatic', async function () {
  this.timeout(60000);
  it('Runs command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const [, stream] = await pop3Command.command('TOP', '1', '0');
    await pop3Command.QUIT();
    const str = await stream2String(stream);
    expect(str).to.contain('Received:');
  });
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
  it('Defaults programmatically to 110 with no port or tls', async function () {
    const pop3Command = new Pop3Command({
      ...config, port: undefined, tls: false
    });
    await pop3Command._connect();
    await pop3Command.QUIT();

    expect(true).to.be.true;
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
});
