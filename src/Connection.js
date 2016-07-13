import { Socket } from 'net';
import tls from 'tls';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

import {
  CRLF,
  CRLF_BUFFER,
  TERMINATOR_BUFFER,
  TERMINATOR_BUFFER_ARRAY,
  MULTI_LINE_COMMAND_NAME
} from './constant';

class Pop3Connection extends EventEmitter {
  
  constructor({
    host,
    port,
    tls,
  }) {
    super();
    this.host = host;
    this.port = port || 110;
    this.tls = tls || false;
    this._socket = null;
    this._stream = null;
    this._command;
  }

  _updateStream() {
    this._stream = new Readable({
      read: () => {},
    });
    return this._stream;
  }

  _pushStream(buffer) {
    if (TERMINATOR_BUFFER_ARRAY.some((_buffer) => _buffer.equals(buffer))) {
      return this._endStream();
    }
    const endBuffer = buffer.slice(-5);
    if (endBuffer.equals(TERMINATOR_BUFFER)) {
      this._stream.push(buffer.slice(0, -5));
      return this._endStream();
    }
    this._stream.push(buffer);
  }

  _endStream(err) {
    this._stream.push(null);
    this._stream = null;
    this.emit('end', err);
  }

  _connect() {
    const { host, port, _queues, _addAsPromise } = this;
    const socket = new Socket();
    socket.setKeepAlive(true);
    return new Promise((resolve, reject) => {
      if (this.tls) {
        this._socket = tls.connect({
          host,
          port,
          socket,
        }, () => console.log(`Connect to ${host}:${port} via tls`));
      } else {
        socket.once('connect', () => console.log(`Connect to ${host}:${port}`));
        this._socket = socket;
      }

      this._socket.on('data', (buffer) => {
        if (this._stream) {
          return this._pushStream(buffer);
        }
        if (buffer[0] === 45) {// '-'
          const err = new Error(buffer.slice(5, -2));
          err.eventName = 'error';
          err.command = this._command;
          return this.emit('error', err);
        }
        if (buffer[0] === 43) {// '+'
          const firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
          const infoBuffer = buffer.slice(4, firstLineEndIndex);
          const commandName = (this._command || '').split(' ')[0];
          let stream = null;
          if (MULTI_LINE_COMMAND_NAME.includes(commandName)) {
            this._updateStream();
            stream = this._stream;
            const bodyBuffer = buffer.slice(firstLineEndIndex + 2);
            if (bodyBuffer[0]) {
              this._pushStream(bodyBuffer);
            }
          }
          this.emit('response', infoBuffer.toString(), stream);
        }
        resolve();
      });
      this._socket.on('error', (err) => {
        err.eventName = 'error';
        if (this._stream) {
          return this.emit('error', err);
        }
        reject(err);
      });
      this._socket.once('close', () => {
        const err = new Error('close');
        err.eventName = 'close';
        reject(err);
        this._socket = null;
      });
      this._socket.once('end', () => {
        const err = new Error('end');
        err.eventName = 'end';
        reject(err);
        this._socket = null;
      });
      socket.connect({
        host,
        port,
      });
    });
  }

  command(...args) {
    this._command = args.join(' ');
    return new Promise((resolve, reject) => {
      if (!this._stream) {
        return resolve();
      }
      this.once('end', (err) => {
        return err ? reject(err) : resolve();
      });
    }).then(() => new Promise((resolve, reject) => {
      const rejectFn = (err) => reject(err);
      this.once('error', rejectFn);
      this.once('response', (info, stream) => {
        this.removeListener('error', rejectFn);
        resolve([info, stream]);
      });
      this._socket.write(`${this._command}${CRLF}`, 'utf8');
    }));
  }

}

export default Pop3Connection;
