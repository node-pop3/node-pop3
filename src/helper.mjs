import { CRLF } from './constant.mjs';
import { totalmem, freemem } from "os";

export function stream2String(stream, maxBufferSize) {

  let maxLength = maxBufferSize
  if (!maxLength) {
    const RAM = totalmem/1024/1024/1024
    if (RAM <= 1) maxLength = 1*1024*1024
    else if (RAM <= 2) maxLength = 2*1024*1024
    else maxLength = 4*1024*1024

  }
  return new Promise((resolve, reject) => {
    let splitBuffer = Buffer.concat([]);
    let finalBufferArr = []
    let finalBufferLength = 0
    let {length} = splitBuffer;
    stream.on('data', (_buffer) => {
      length += _buffer.length;
      finalBufferLength += _buffer.length;
      if (length >= maxLength) {
        const bufferToPush = Buffer.concat([splitBuffer, _buffer], length)
        finalBufferArr.push(bufferToPush)
        splitBuffer = Buffer.concat([])
        length = 0
      }
      else splitBuffer = Buffer.concat([splitBuffer, _buffer], length);
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      let finalBuffer
      if (finalBufferArr.length !== 0) {
        finalBufferArr.push(splitBuffer)
        finalBuffer = Buffer.concat(finalBufferArr, finalBufferLength);
      } else finalBuffer = splitBuffer
      resolve(finalBuffer.toString())
    });
  });
}

export function listify(str) {
  return str.split(CRLF)
    .filter((line) => line)
    .map((line) => line.split(' '));
}
