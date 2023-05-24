"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _net = require("net");
var _tls2 = _interopRequireDefault(require("tls"));
var _events = require("events");
var _stream = require("stream");
var _constant = require("./constant.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @typedef {number} Integer
 */

/* eslint-disable unicorn/prefer-event-target -- Should replace for browser */
/**
 *
 */
class Pop3Connection extends _events.EventEmitter {
  /* eslint-enable unicorn/prefer-event-target -- Should replace for browser */
  /**
   * @param {{
  *   host: string,
  *   port?: Integer,
  *   tls?: boolean,
  *   timeout?: Integer,
  *   tlsOptions?: import('tls').TlsOptions,
  *   servername?: string
  * }} cfg
  */
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
    this._command = '';
    this.tlsOptions = tlsOptions || {};
    this.servername = servername || host;
  }

  /**
   * @returns {Readable}
   */
  _updateStream() {
    this._stream = new _stream.Readable({
      read() {
        //
      }
    });
    return this._stream;
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  _pushStream(buffer) {
    if (_constant.TERMINATOR_BUFFER_ARRAY.some(_buffer => _buffer.equals(buffer))) {
      this._endStream();
      return;
    }
    const endBuffer = buffer.subarray(-5);
    if (endBuffer.equals(_constant.TERMINATOR_BUFFER)) {
      /** @type {Readable} */this._stream.push(buffer.subarray(0, -5));
      this._endStream();
      return;
    }
    /** @type {Readable} */
    this._stream.push(buffer);
  }

  /**
   * @param {Error} [err]
   * @returns {void}
   */
  _endStream(err) {
    if (this._stream) {
      this._stream.push(null);
    }
    this._stream = null;
    this.emit('end', err);
  }

  /**
   * @returns {Promise<void>}
   */
  connect() {
    const {
      host,
      port,
      tlsOptions,
      servername
    } = this;
    const socket = new _net.Socket();
    socket.setKeepAlive(true);
    // eslint-disable-next-line promise/avoid-new -- Our own API
    return new Promise(( /** @type {(val?: any) => void} */
    resolve, reject) => {
      if (typeof this.timeout !== 'undefined') {
        socket.setTimeout(this.timeout, () => {
          const err = /** @type {Error & {eventName: "timeout"}} */
          new Error('timeout');
          err.eventName = 'timeout';
          reject(err);
          if (this.listeners('end').length) {
            this.emit('end', err);
          }
          if (this.listeners('error').length) {
            this.emit('error', err);
          }
          /** @type {import('tls').TLSSocket} */
          this._socket.end();
          this._socket = null;
        });
      }
      if (this.tls) {
        const options = {
          host,
          port,
          socket,
          servername,
          ...tlsOptions
        };
        // @ts-expect-error Works
        this._socket = _tls2.default.connect(options);
      } else {
        this._socket = socket;
      }
      this._socket.on('data',
      /**
       * @param {Buffer} buffer
       * @returns {void}
       */
      buffer => {
        if (this._stream) {
          this._pushStream(buffer);
          return;
        }
        if (buffer[0] === 45) {
          // '-'
          const err =
          /**
           * @type {Error & {eventName: "error", command: string|undefined}}
           */
          new Error(buffer.subarray(5, -2));
          err.eventName = 'error';
          err.command = this._command;
          this.emit('error', err);
          return;
        }
        if (buffer[0] === 43) {
          // '+'
          const firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
          const infoBuffer = buffer.subarray(4, firstLineEndIndex);
          const [commandName, msgNumber] = (this._command || '').split(' ');
          let stream = null;
          if (_constant.MULTI_LINE_COMMAND_NAME.includes(commandName) || !msgNumber && _constant.MAYBE_MULTI_LINE_COMMAND_NAME.includes(commandName)) {
            this._updateStream();
            stream = this._stream;
            const bodyBuffer = buffer.subarray(firstLineEndIndex + 2);
            if (bodyBuffer[0]) {
              this._pushStream(bodyBuffer);
            }
          }
          this.emit('response', infoBuffer.toString(), stream);
          resolve();
          return;
        }
        const err =
        /**
         * @type {Error & {eventName: "bad-server-response"}}
         */
        new Error('Unexpected response');
        err.eventName = 'bad-server-response';
        reject(err);
      });
      this._socket.on('error', err => {
        err.eventName = 'error';
        if (this._stream) {
          this.emit('error', err);
          return;
        }
        reject(err);
        this._socket = null;
      });
      this._socket.once('close', () => {
        const err = /** @type {Error & {eventName: "close"}} */
        new Error('close');
        err.eventName = 'close';
        reject(err);
        this._socket = null;
      });
      this._socket.once('end', () => {
        const err = /** @type {Error & {eventName: "end"}} */
        new Error('end');
        err.eventName = 'end';
        reject(err);
        this._socket = null;
      });
      socket.connect({
        host,
        port
      });
    });
  }

  /**
   * @param {...(string|Integer)} args
   * @throws {Error}
   * @returns {Promise<[string, Readable]>}
   */
  async command(...args) {
    this._command = args.join(' ');
    if (!this._socket) {
      throw new Error('no-socket');
    }
    // eslint-disable-next-line promise/avoid-new -- Our own API
    await new Promise(( /** @type {(value?: any) => void} */
    resolve, reject) => {
      if (!this._stream) {
        resolve();
        return;
      }
      this.once('error', err => {
        reject(err);
      });
      this.once('end', err => {
        return err ? reject(err) : resolve();
      });
    });

    // eslint-disable-next-line promise/avoid-new -- Our own API
    return new Promise((resolve, reject) => {
      /**
       * @param {Error} err
       */
      const rejectFn = err => reject(err);
      this.once('error', rejectFn);
      this.once('response', (info, stream) => {
        this.removeListener('error', rejectFn);
        resolve([info, stream]);
      });
      if (!this._socket) {
        reject(new Error('no-socket'));
      }
      /** @type {Socket} */
      this._socket.write(`${this._command}${_constant.CRLF}`, 'utf8');
    });
  }
}
var _default = Pop3Connection;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Connection.cjs.map