"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stream2String = stream2String;
exports.listify = listify;

var _constant = require("./constant.js");

function stream2String(stream) {
  return new Promise(function (resolve, reject) {
    var buffer = Buffer.concat([]);
    var _buffer2 = buffer,
        length = _buffer2.length;
    stream.on('data', function (_buffer) {
      length += _buffer.length;
      buffer = Buffer.concat([buffer, _buffer], length);
    });
    stream.on('error', function (err) {
      return reject(err);
    });
    stream.on('end', function () {
      return resolve(buffer.toString());
    });
  });
}

function listify(str) {
  return str.split(_constant.CRLF).filter(function (line) {
    return line;
  }).map(function (line) {
    return line.split(' ');
  });
}
//# sourceMappingURL=helper.js.map