import { CRLF } from './constant.mjs';

export function stream2String(stream, maxBufferSize) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.concat([]);
    let {length} = buffer;
    stream.on('data', (_buffer) => {
      length += _buffer.length;
      if (length >= maxBufferSize) {
        const err = new Error('mailSizeExceeded');
        err.eventName = 'max-mail-size-exceeded';
        stream.destroy(err);
      }
      else buffer = Buffer.concat([buffer, _buffer], length);
    });
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(buffer.toString()));
  });
}

export function listify(str) {
  return str.split(CRLF)
    .filter((line) => line)
    .map((line) => line.split(' '));
}
