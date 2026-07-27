import {CRLF} from './constant.js';

/**
 * @param {import('stream').Stream} stream
 */
export function stream2String (stream) {
  // eslint-disable-next-line promise/avoid-new -- Our own API
  return new Promise((resolve, reject) => {
    let buffer = Buffer.concat([]);
    let {length: len} = buffer;
    stream.on('data', (_buffer) => {
      len += _buffer.length;
      buffer = Buffer.concat([buffer, _buffer], len);
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      // Reverse POP3 byte-stuffing (RFC 1939 Section 3):
      // The server prepends a '.' to any line starting with '.' to avoid
      // confusion with the multi-line terminator. The client must remove it.
      const result = dotUnstuff(buffer);
      resolve(result.toString());
    });
  });
}

/**
 * Reverse POP3 dot-stuffing (RFC 1939 Section 3).
 *
 * Any line beginning with ".." has the extra leading "." removed.
 *
 * @param {Buffer} buffer
 * @returns {Buffer}
 */
function dotUnstuff (buffer) {
  const dot = 0x2E;
  const cr = 0x0D;
  const lf = 0x0A;
  const chunks = [];
  // Check first line (no preceding CRLF)
  let start = buffer.length >= 2 && buffer[0] === dot && buffer[1] === dot
    ? 1
    : 0;

  let i = start;
  while (i <= buffer.length - 4) {
    if (
      buffer[i] === cr &&
      buffer[i + 1] === lf &&
      buffer[i + 2] === dot &&
      buffer[i + 3] === dot
    ) {
      // Include up to and including \r\n.
      chunks.push(buffer.subarray(start, i + 3));
      // Skip the extra dot
      start = i + 4;
      i = start;
    } else {
      i++;
    }
  }

  if (start === 0 && chunks.length === 0) {
    return buffer;
  }

  chunks.push(buffer.subarray(start));
  return Buffer.concat(chunks);
}

/**
 * @param {string} str
 * @returns {string[][]}
 */
export function listify (str) {
  return str.split(CRLF).
    filter(Boolean).
    map((line) => line.split(' '));
}
