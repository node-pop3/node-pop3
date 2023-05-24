"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listify = listify;
exports.stream2String = stream2String;
var _constant = require("./constant.cjs");
/**
 * @param {import('stream').Stream} stream
 */
function stream2String(stream) {
  // eslint-disable-next-line promise/avoid-new -- Our own API
  return new Promise((resolve, reject) => {
    let buffer = Buffer.concat([]);
    let {
      length: len
    } = buffer;
    stream.on('data', _buffer => {
      len += _buffer.length;
      buffer = Buffer.concat([buffer, _buffer], len);
    });
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(buffer.toString()));
  });
}

/**
 * @param {string} str
 * @returns {string[][]}
 */
function listify(str) {
  return str.split(_constant.CRLF).filter(Boolean).map(line => line.split(' '));
}
//# sourceMappingURL=helper.cjs.map