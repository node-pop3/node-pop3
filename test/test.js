import spawnAsync from '@expo/spawn-async';

describe('CLI', function () {
  this.timeout(10000);
  it('Gets help', async function () {
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--help']);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Usage: pop [options]');
  });
  it('Errs upon missing mehtod', async function () {
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', [
      '--config',
      'pop.config.json'
    ]);
    expect(stderr).to.equal('method is required!\n');
    expect(stdout).to.contain('Usage: pop [options]');
  });
});
