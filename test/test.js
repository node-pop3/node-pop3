import spawnAsync from '@expo/spawn-async';

describe('CLI', function () {
  this.timeout(10000);
  it('Gets help', async function () {
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--help']);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Usage: pop [options]');
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
});
