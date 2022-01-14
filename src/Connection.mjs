import { Socket } from 'net';
import _tls from 'tls';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

import {
  CRLF,
  CRLF_BUFFER,
  TERMINATOR_BUFFER,
  TERMINATOR_BUFFER_ARRAY,
  MULTI_LINE_COMMAND_NAME
} from './constant.mjs';

class Pop3Connection extends EventEmitter {
  constructor({
    host,
    port,
    tls,
    timeout,
    tlsOptions,
    servername
  }) {
    super();
    this.host = host;
    this.port = port || (tls ? 995 : 110);
    this.tls = tls;
    this.timeout = timeout;
    this._socket = null;
    this._stream = null;
    this._command;
    this.tlsOptions = tlsOptions || {};
    this.servername = servername || host;
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
    if (this._stream) {
      this._stream.push(null);
    }
    this._stream = null;
    this.emit('end', err);
  }

  connect() {
    const { host, port, tlsOptions, servername } = this;
    const socket = new Socket();
    socket.setKeepAlive(true);
    return new Promise((resolve, reject) => {
      if (typeof this.timeout !== 'undefined') {
        socket.setTimeout(this.timeout, () => {
          const err = new Error('timeout');
          err.eventName = 'timeout';
          reject(err);
          if (this.listeners('end').length) {
            this.emit('end', err);
          }
          if (this.listeners('error').length) {
            this.emit('error', err);
          }
          this._socket.end();
          this._socket = null;
        });
      }
      if (this.tls) {
        const options = Object.assign({ host, port, socket, servername }, tlsOptions);
        this._socket = _tls.connect(options);
      } else {
        this._socket = socket;
      }

      this._socket.on('data', (buffer) => {
        if (this._stream) {
          return this._pushStream(buffer);
        }
        if (buffer[0] === 45) { // '-'
          const err = new Error(buffer.slice(5, -2));
          err.eventName = 'error';
          err.command = this._command;
          return this.emit('error', err);
        }
        if (buffer[0] === 43) { // '+'
          const firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
          const infoBuffer = buffer.slice(4, firstLineEndIndex);
          const [commandName] = (this._command || '').split(' ');
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
          resolve();
          return;
        }
        const err = new Error('Unexpected response');
        err.eventName = 'bad-server-response';
        reject(err);
      });
      this._socket.on('error', (err) => {
        err.eventName = 'error';
        if (this._stream) {
          this.emit('error', err);
          return;
        }
        reject(err);
        this._socket = null;
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

  async command(...args) {
    this._command = args.join(' ');
    if (!this._socket) {
      throw new Error('no-socket');
    }
    await new Promise((resolve, reject) => {
      if (!this._stream) {
        return resolve();
      }
      this.once('error', (err) => {
        return reject(err);
      });
      this.once('end', (err) => {
        return err ? reject(err) : resolve();
      });
    });
    return new Promise((resolve, reject) => {
      const rejectFn = (err) => reject(err);
      this.once('error', rejectFn);
      this.once('response', (info, stream) => {
        this.removeListener('error', rejectFn);
        resolve([info, stream]);
      });
      if (!this._socket) {
        reject(new Error('no-socket'));
      }
      this._socket.write(`${this._command}${CRLF}`, 'utf8');
    });
  }
}

export default Pop3Connection;
