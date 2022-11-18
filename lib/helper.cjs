"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listify = listify;
exports.stream2String = stream2String;
var _constant = require("./constant.cjs");
function stream2String(stream) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.concat([]);
    let {
      length
    } = buffer;
    stream.on('data', _buffer => {
      length += _buffer.length;
      buffer = Buffer.concat([buffer, _buffer], length);
    });
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(buffer.toString()));
  });
}
function listify(str) {
  return str.split(_constant.CRLF).filter(line => line).map(line => line.split(' '));
}
//# sourceMappingURL=helper.cjs.map