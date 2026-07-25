import {Readable} from 'stream';

import {expect} from 'chai';

import {stream2String} from '../src/helper.js';

/**
 * @param {string} str
 * @returns {Readable}
 */
function makeStream (str) {
  return Readable.from([Buffer.from(str)]);
}

describe('stream2String dot-unstuffing', function () {
  it(
    'removes extra leading dot on first line starting with ".."',
    async function () {
      const result = await stream2String(
        makeStream('..com/example\r\nsome text')
      );
      expect(result).to.equal('.com/example\r\nsome text');
    }
  );

  it(
    'removes extra leading dot on a mid-message line starting with ".."',
    async function () {
      const result = await stream2String(
        makeStream('first line\r\n..stuffed line\r\nnormal line')
      );
      expect(result).to.equal('first line\r\n.stuffed line\r\nnormal line');
    }
  );

  it('handles multiple dot-stuffed lines', async function () {
    const result = await stream2String(
      makeStream('first\r\n..one\r\n..two\r\nnormal')
    );
    expect(result).to.equal('first\r\n.one\r\n.two\r\nnormal');
  });

  it(
    'handles dot-stuffed first line and mid-message line together',
    async function () {
      const result = await stream2String(
        makeStream('..first\r\nnormal\r\n..second')
      );
      expect(result).to.equal('.first\r\nnormal\r\n.second');
    }
  );

  it(
    'leaves normal content without dot-stuffing unchanged',
    async function () {
      const result = await stream2String(
        makeStream('normal content\r\nno dot stuffing')
      );
      expect(result).to.equal('normal content\r\nno dot stuffing');
    }
  );

  it(
    'leaves a line starting with a single "." unchanged',
    async function () {
      const result = await stream2String(
        makeStream('first line\r\n.single dot\r\nnormal')
      );
      expect(result).to.equal('first line\r\n.single dot\r\nnormal');
    }
  );

  it('handles an empty buffer', async function () {
    const result = await stream2String(makeStream(''));
    expect(result).to.equal('');
  });
});
