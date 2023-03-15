import spawnAsync from '@expo/spawn-async';

describe('CLI', function () {
  describe('Basic commands', function () {
    this.timeout(8000);
    it('Gets help', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--help']);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Usage: pop [options]');
    });
    it('Ignores empty command', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--']);
      expect(stderr).to.equal('user is required!\n');
      expect(stdout).to.contain('Usage: pop [options]');
    });

    it('Times out', async function () {
      this.timeout(40000);
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'LIST',
        '--timeout',
        '10'
      ]);
      expect(stderr).to.contain('Error: timeout');
      expect(stdout).to.equal('');
    });
  });

  describe('POP commands', function () {
    this.timeout(60000);

    it('Override config to run without TLS', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--no-tls',
        '--method',
        'QUIT'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal("'Bye'\n");
    });

    it('Runs QUIT', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'QUIT'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal("'Bye'\n");
    });

    // Todo: For RETR, TOP, and LIST, we should really seed the account with an
    //   email to ensure one exists (could add `emailjs` as a dependency)
    it('Runs RETR', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'RETR',
        '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Received:');
    });
    it('Runs TOP', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'TOP',
        '1',
        '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Received:');
    });
    it('Runs LIST', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'LIST'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.match(/'\d+ messages:'/u).and.match(/'\d+ \d+(\\r\\n\d+ \d+)*'/u);
    });
    it('Runs UIDL', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'UIDL'
        // '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain("[ [ '1',");
    });
    it('Runs NOOP', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'NOOP'
        // '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal("[ '', null ]\n");
    });
    it('Runs STAT', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'STAT'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.match(/\[ '\d+ \d+', null \]\n/u);
    });
    it('Runs RSET', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'RSET'
        // '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain("[ '', null ]\n");
    });
    it('Runs DELE', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'DELE',
        '1'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain("[ 'Marked to be deleted.', null ]\n");
    });

    // Todo: Test APOP
  });

  describe('CLI Errors', function () {
    it('Errs with bad user/pass', async function () {
      this.timeout(10000);
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--user',
        'brett@example.name',
        '--password',
        '123456',
        '--host',
        'example.name',
        '--method',
        'NOOP'
        // '1'
      ]);
      expect(stderr).to.contain('getaddrinfo ENOTFOUND');
      expect(stdout).to.equal('');
    });
    it('Errs upon invalid alias', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '-x'
      ]);
      expect(stderr).to.equal('Invalid alias x\n');
      expect(stdout).to.equal('');
    });
    it('Errs upon invalid argument', async function () {
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        'xyz'
      ]);
      expect(stderr).to.equal('Invalid argument xyz\n');
      expect(stdout).to.equal('');
    });
    it('Errs upon missing method', async function () {
      let {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json'
      ]);
      expect(stderr).to.equal('method is required!\n');
      expect(stdout).to.contain('Usage: pop [options]');

      ({stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '-u',
        'brett@example.name'
      ]));
      expect(stderr).to.equal('method is required!\n');
      expect(stdout).to.contain('Usage: pop [options]');
    });

    it('Errs on bad RETR', async function () {
      this.timeout(60000);
      const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
        '--config',
        'pop.config.json',
        '--method',
        'RETR',
        '0'
      ]);
      expect(stderr).to.contain("There's no message 0");
      expect(stdout).to.equal('');
    });
  });
});
