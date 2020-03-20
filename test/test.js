import spawnAsync from '@expo/spawn-async';

describe('CLI', function () {
  this.timeout(20000);
  it('Gets help', async function () {
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--help']);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Usage: pop [options]');
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
      '--timeout',
      '10000',
      '--method',
      'TOP',
      '1',
      '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Received:');
  });
  it('Runs LIST', async function () {
    this.timeout(20000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json',
      '--method',
      'LIST',
      '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Received:');
  });
  it('Runs UIDL', async function () {
    this.timeout(20000);
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
    this.timeout(20000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json',
      '--method',
      'NOOP'
      // '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('OK');
  });
  it('Runs STAT', async function () {
    this.timeout(20000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json',
      '--method',
      'STAT'
      // '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain("[ [ '1',");
  });
  it('Runs RSET', async function () {
    this.timeout(20000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json',
      '--method',
      'RSET'
      // '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain("[ [ '1',");
  });
  it('Runs DELE', async function () {
    this.timeout(20000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json',
      '--method',
      'DELE',
      '1'
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain("[ [ '1',");
  });

  // Todo: Test APOP

  describe('Errors', function () {
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
  });
});
