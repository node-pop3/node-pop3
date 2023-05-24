import {CRLF} from './constant.js';

/**
 * @param {import('stream').Stream} stream
 */
export function stream2String(stream) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.concat([]);
    let {length} = buffer;
    stream.on('data', (_buffer) => {
      length += _buffer.length;
      buffer = Buffer.concat([buffer, _buffer], length);
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(buffer.toString()));
  });
}

/**
 * @param {string} str
 * @returns {string[][]}
 */
export function listify(str) {
  return str.split(CRLF)
    .filter((line) => line)
    .map((line) => line.split(' '));
}
