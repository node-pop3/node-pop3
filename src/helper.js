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
    stream.on('end', () => resolve(buffer.toString()));
  });
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
