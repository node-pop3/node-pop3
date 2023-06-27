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
    var streamTimeout = setTimeout(function () {
      reject({
        eventName: 'timeout',
        name: 'stream2String timeout'
      });
    }, 5 * 60 * 1000);
    var finalBufferArr = [];
    var finalBufferLength = 0;
    var bufferChunk = Buffer.concat([]);
    var bufferLength = bufferChunk.length;
    stream.on('data', function (_buffer) {
      bufferLength += _buffer.length;
      finalBufferLength += _buffer.length;
      if (bufferLength >= maxLength) {
        var bufferToPush = Buffer.concat([bufferChunk, _buffer], bufferLength);
        finalBufferArr.push(bufferToPush);
        bufferChunk = Buffer.concat([]);
        bufferLength = bufferChunk.length;
      } else bufferChunk = Buffer.concat([bufferChunk, _buffer], bufferLength);
    });
    stream.on('error', function (err) {
      return reject(err);
    });
    stream.on('end', function () {
      var finalBuffer;
      if (finalBufferArr.length !== 0) {
        finalBufferArr.push(bufferChunk);
        finalBuffer = Buffer.concat(finalBufferArr, finalBufferLength);
      } else finalBuffer = bufferChunk;
      clearTimeout(streamTimeout);
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