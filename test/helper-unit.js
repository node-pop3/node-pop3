import {Readable} from 'stream';

import {expect} from 'chai';

import {stream2String} from '../src/helper.js';

/**
 * @param {string} str
 * @returns {Readable}
 */
function stringToStream (str) {
  return Readable.from([Buffer.from(str)]);
}

describe('stream2String / dotUnstuff', function () {
  it('returns plain content unchanged when no dot-stuffing is present',
    async function () {
      const input = 'Hello\r\nWorld\r\n';
      const stream = stringToStream(input);
      const result = await stream2String(stream);
      expect(result).to.equal(input);
    });

  it('removes extra dot from first line starting with ".."', async function () {
    const input = '..firstline\r\nnormal\r\n';
    const stream = stringToStream(input);
    const result = await stream2String(stream);
    expect(result).to.equal('.firstline\r\nnormal\r\n');
  });

  it('removes extra dot from a mid-message line starting with ".."',
    async function () {
      const input = 'normal\r\n..dotline\r\nend\r\n';
      const stream = stringToStream(input);
      const result = await stream2String(stream);
      expect(result).to.equal('normal\r\n.dotline\r\nend\r\n');
    });

  it('handles multiple dot-stuffed lines', async function () {
    const input = '..first\r\nnormal\r\n..second\r\nend\r\n';
    const stream = stringToStream(input);
    const result = await stream2String(stream);
    expect(result).to.equal('.first\r\nnormal\r\n.second\r\nend\r\n');
  });

  it('handles dot-stuffing on the first and a subsequent line',
    async function () {
      const input = '..first\r\n..second\r\n';
      const stream = stringToStream(input);
      const result = await stream2String(stream);
      expect(result).to.equal('.first\r\n.second\r\n');
    });
});
