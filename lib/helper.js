"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listify = listify;
exports.stream2String = stream2String;
var _constant = require("./constant.js");
var _os = require("os");
function stream2String(stream, maxBufferSize) {
  var maxLength = maxBufferSize;
  if (!maxLength) {
    var RAM = _os.totalmem / 1024 / 1024 / 1024;
    if (RAM <= 1) maxLength = 1 * 1024 * 1024;else if (RAM <= 2) maxLength = 2 * 1024 * 1024;else maxLength = 4 * 1024 * 1024;
  }
  return new Promise(function (resolve, reject) {
    var splitBuffer = Buffer.concat([]);
    var finalBufferArr = [];
    var finalBufferLength = 0;
    var _splitBuffer = splitBuffer,
      length = _splitBuffer.length;
    stream.on('data', function (_buffer) {
      length += _buffer.length;
      finalBufferLength += _buffer.length;
      if (length >= maxLength) {
        var bufferToPush = Buffer.concat([splitBuffer, _buffer], length);
        finalBufferArr.push(bufferToPush);
        splitBuffer = Buffer.concat([]);
        length = 0;
      } else splitBuffer = Buffer.concat([splitBuffer, _buffer], length);
    });
    stream.on('error', function (err) {
      return reject(err);
    });
    stream.on('end', function () {
      var finalBuffer;
      if (finalBufferArr.length !== 0) {
        finalBufferArr.push(splitBuffer);
        finalBuffer = Buffer.concat(finalBufferArr, finalBufferLength);
      } else finalBuffer = splitBuffer;
      resolve(finalBuffer.toString());
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