import spawnAsync from '@expo/spawn-async';

describe('CLI', function () {
  it('Gets help', async function () {
    this.timeout(10000);
    const {stdout, stderr} = await spawnAsync('./bin/pop.js', ['--help']);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Usage: pop [options]');
  });
});
