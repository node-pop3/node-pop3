import Pop3Command from '../src/Command.js';

import {stream2String} from '../src/helper.js';

import config from '../pop.config.json';

describe('Programmatic', async function () {
  it('Runs command', async function () {
    const pop3Command = new Pop3Command(config);
    await pop3Command.connect();
    await pop3Command.command('USER', config.user);
    await pop3Command.command('PASS', config.password);
    const [, stream] = await pop3Command.command('TOP', '1', '0');
    const str = await stream2String(stream);
    expect(str).to.contain('Received:');
  });
});
