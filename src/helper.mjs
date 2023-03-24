import { CRLF } from './constant.mjs';
import { totalmem } from 'os';

export function stream2String(stream, maxBufferSize) {

  let maxLength = maxBufferSize;
  if (!maxLength) {
    const RAM = totalmem/1024/1024/1024;
    if (RAM <= 1) maxLength = 1*1024*1024;
    else if (RAM <= 2) maxLength = 2*1024*1024;
    else maxLength = 4*1024*1024;
  }
  return new Promise((resolve, reject) => {
    const finalBufferArr = [];
    let finalBufferLength = 0;
    let bufferChunk = Buffer.concat([]);
    let bufferLength = bufferChunk.length;
    stream.on('data', (_buffer) => {
      bufferLength += _buffer.length;
      finalBufferLength += _buffer.length;
      if (bufferLength >= maxLength) {
        const bufferToPush = Buffer.concat([bufferChunk, _buffer], bufferLength);
        finalBufferArr.push(bufferToPush);
        bufferChunk = Buffer.concat([]);
        bufferLength = bufferChunk.length;
      }
      else bufferChunk = Buffer.concat([bufferChunk, _buffer], bufferLength);
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      let finalBuffer;
      if (finalBufferArr.length !== 0) {
        finalBufferArr.push(bufferChunk);
        finalBuffer = Buffer.concat(finalBufferArr, finalBufferLength);
      } else finalBuffer = bufferChunk;
      resolve(finalBuffer.toString());
    });
  });
}

export function listify(str) {
  return str.split(CRLF)
    .filter((line) => line)
    .map((line) => line.split(' '));
}
