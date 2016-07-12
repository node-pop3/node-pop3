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
    this.port = port;
    this.tls = tls;
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
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.tls) {
        self._socket = tls.connect({
          host,
          port,
          socket,
        }, () => console.log(`Connect to ${host}:${port} via tls`));
      } else {
        socket.once('connect', () => console.log(`Connect to ${host}:${port}`));
        self._socket = socket;
      }

      self._socket.on('data', (buffer) => {
        if (self._stream) {
          return self._pushStream(buffer);
        }
        if (buffer[0] === 45) {// '-'
          const err = new Error(buffer.slice(5, -2));
          err.eventName = 'error';
          err.command = self._command;
          return self.emit('error', err);
        }
        if (buffer[0] === 43) {// '+'
          const firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
          const infoBuffer = buffer.slice(4, firstLineEndIndex);
          const commandName = (self._command || '').split(' ')[0];
          let stream = null;
          if (MULTI_LINE_COMMAND_NAME.includes(commandName)) {
            self._updateStream();
            stream = self._stream;
            const bodyBuffer = buffer.slice(firstLineEndIndex + 2);
            if (bodyBuffer[0]) {
              self._pushStream(bodyBuffer);
            }
          }
          self.emit('response', infoBuffer.toString(), stream);
        }
        resolve();
      });
      self._socket.on('error', (err) => {
        err.eventName = 'error';
        if (self._stream) {
          return self.emit('error', err);
        }
        reject(err);
      });
      self._socket.once('closed', () => {
        self._socket.destroy();
        const err = new Error('closed');
        err.eventName = 'closed';
        reject(err);
        self._socket = null;
      });
      self._socket.once('end', () => {
        self._socket.destroy();
        const err = new Error('end');
        err.eventName = 'end';
        reject(err);
        self._socket = null;
      });
      socket.connect({
        host,
        port,
      });
    });
  }

  command(...args) {
    this._command = args.join(' ');
    const self = this;
    return new Promise((resolve, reject) => {
      if (!self._stream) {
        return resolve();
      }
      self.once('end', (err) => {
        return err ? reject(err) : resolve();
      });
    }).then(() => new Promise((resolve, reject) => {
      const rejectFn = (err) => reject(err);
      self.once('error', rejectFn);
      self.once('response', (info, stream) => {
        self.removeListener('error', rejectFn);
        console.log('command:', self._command);
        resolve([info, stream]);
      });
      self._socket.write(`${self._command}${CRLF}`, 'utf8');
    }));
  }

}

export default Pop3Connection;
