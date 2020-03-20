import 'regenerator-runtime/runtime.js';

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
});
