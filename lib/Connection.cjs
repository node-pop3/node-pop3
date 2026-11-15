"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeNet = require("node:net");
var _nodeTls = _interopRequireDefault(require("node:tls"));
var _nodeEvents = require("node:events");
var _nodeStream = require("node:stream");
var _constant = require("./constant.cjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @typedef {number} Integer
 */

/* eslint-disable unicorn/prefer-event-target -- Should replace for browser */
/**
 *
 */
class Pop3Connection extends _nodeEvents.EventEmitter {
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
    this._streamAtLineStart = true;
    this._heldBack = Buffer.alloc(0);
    this._command = '';
    this._pendingResponseBuffer = Buffer.concat([]);
    this.tlsOptions = tlsOptions || {};
    this.servername = servername || host;
  }

  /**
   * @returns {boolean}
   */
  _hasActiveSocket() {
    return Boolean(this._socket && !this._socket.destroyed && this._socket.writable && !this._socket.writableEnded);
  }

  /**
   * @returns {Readable}
   */
  _updateStream() {
    this._stream = new _nodeStream.Readable({
      read() {
        //
      }
    });
    // A fresh stream always begins at a line boundary (right after the
    //   response's info line), so the short terminator forms ('.\r\n'
    //   and '.') are valid here; see `_pushStream`.
    this._streamAtLineStart = true;
    this._heldBack = Buffer.alloc(0);
    return this._stream;
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  _pushStream(buffer) {
    // The full '\r\n.\r\n' form carries its own preceding line break, so
    //   it unambiguously marks a terminator wherever it lands. The short
    //   forms ('.\r\n' and '.') omit that line break because some servers
    //   split it into an earlier chunk whose trailing CRLF was already
    //   pushed to the stream; they are only trustworthy when this chunk
    //   is known to start a new line. Without that guard, a chunk that
    //   coincidentally *is* just "." or ".\r\n" in the middle of real
    //   body content (e.g., a lone "." from an arbitrary TCP/TLS
    //   fragmentation boundary) would end the stream early, and the next,
    //   still-legitimate body chunk would then be misread as a fresh
    //   top-level response (see node-pop3 issue about corrupted -ERR
    //   messages during RETR).
    const stream = /** @type {Readable} */this._stream;
    const held = this._heldBack;
    if (_constant.TERMINATOR_BUFFER.equals(buffer) || this._streamAtLineStart && _constant.TERMINATOR_BUFFER_ARRAY.slice(1).some(_buffer => _buffer.equals(buffer))) {
      if (held.length) {
        stream.push(held);
      }
      this._heldBack = Buffer.alloc(0);
      this._endStream();
      return;
    }
    // The terminator may be split across chunks (e.g., "\r" | "\n.\r\n"),
    //   so hold back the last 4 bytes until the next chunk shows whether
    //   they begin a terminator.
    const data = held.length ? Buffer.concat([held, buffer]) : buffer;
    if (data.subarray(-5).equals(_constant.TERMINATOR_BUFFER)) {
      this._heldBack = Buffer.alloc(0);
      const body = data.subarray(0, -5);
      if (body.length) {
        stream.push(body);
      }
      this._endStream();
      return;
    }
    const keep = Math.min(4, data.length);
    if (data.length > keep) {
      stream.push(data.subarray(0, data.length - keep));
    }
    this._heldBack = Buffer.from(data.subarray(data.length - keep));
    if (buffer.length) {
      this._streamAtLineStart = buffer.at(-1) === 10; // '\n'
    }
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
    const socket = new _nodeNet.Socket();
    socket.setKeepAlive(true);
    // eslint-disable-next-line promise/avoid-new -- Our own API
    return new Promise((
    // eslint-disable-next-line jsdoc/reject-any-type -- Promise API
    /** @type {(val?: any) => void} */
    resolve, reject) => {
      let settled = false;
      const safeResolve = () => {
        if (settled) {
          return;
        }
        settled = true;
        this.removeListener('error', safeReject);
        resolve();
      };

      /**
       * @param {Error & {
       *   eventName: "timeout"|"bad-server-response"|"close"|"end"
       * }} e
       */
      const safeReject = e => {
        if (this.listeners('warn').length) {
          this.emit('warn', e);
        }
        if (settled) {
          return;
        }
        settled = true;
        this.removeListener('error', safeReject);
        reject(e);
      };

      // `command()` listens for our own `error` event while a command is
      //   in flight, but until a command is sent (e.g., while awaiting the
      //   server's initial greeting), nothing does. Without this listener,
      //   an `error` emitted below (e.g., a `-ERR` greeting) would have no
      //   listener, and Node throws such unhandled `error` events,
      //   crashing the process.
      this.once('error', safeReject);

      // `safeReject` above is removed as soon as `connect()` settles, and
      //   each `command()` call's own `error` listener is likewise removed
      //   as soon as *that* command's initial response line arrives — even
      //   though, for a multi-line command (RETR/TOP/CAPA), the body may
      //   still be streaming in. An `error` re-emitted afterward (e.g.,
      //   from the socket `error` handler below while a stream is active)
      //   would then have no listener left at all and crash the process
      //   instead of reaching whoever is actually consuming the stream.
      //   This permanent listener closes that gap for the rest of the
      //   connection's life by routing such an error to the active stream.
      this.on('error', err => {
        // Only forward to the stream if something is actually listening
        //   for its `error` event (as `stream2String` does): destroying an
        //   otherwise-unwatched stream would just trade one unhandled
        //   `error` event (on the connection) for another (on the
        //   stream). Callers that obtain the raw stream and rely solely
        //   on the connection's own `error` event are unaffected.
        if (this._stream && typeof this._stream.destroy === 'function' && typeof this._stream.listenerCount === 'function' && this._stream.listenerCount('error') > 0) {
          this._stream.destroy(err);
        }
      });
      if (typeof this.timeout !== 'undefined') {
        socket.setTimeout(this.timeout, () => {
          const err = /** @type {Error & {eventName: "timeout"}} */
          new Error('timeout');
          err.eventName = 'timeout';
          safeReject(err);
          if (this.listeners('end').length) {
            this.emit('end', err);
          }
          if (this._socket && !this._socket.destroyed) {
            this._socket.end();
          }
          this._socket = null;
          if (this._stream) {
            this._stream.destroy();
          }
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
        this._socket = _nodeTls.default.connect(options);
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
        if (this._pendingResponseBuffer.length) {
          const len = this._pendingResponseBuffer.length + buffer.length;
          buffer = Buffer.concat([this._pendingResponseBuffer, buffer], len);
          this._pendingResponseBuffer = Buffer.concat([]);
        }
        if (buffer[0] === 45 || buffer[0] === 43) {
          const firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
          if (firstLineEndIndex === -1) {
            this._pendingResponseBuffer = Buffer.from(buffer);
            return;
          }
        }
        if (buffer[0] === 45) {
          // '-'
          const err =
          /**
           * @type {Error & {eventName: "error", command: string|undefined}}
           */
          // @ts-expect-error It's ok
          new Error(buffer.subarray(5, buffer.indexOf(_constant.CRLF_BUFFER)));
          err.eventName = 'error';
          // https://github.com/node-pop3/node-pop3/issues/37
          err.command = this._command.startsWith('PASS ') ? 'PASS ***' : this._command;
          this.emit('error', err);
          return;
        }
        if (buffer[0] === 43) {
          // '+'
          const firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
          const infoBuffer = buffer.subarray(4, firstLineEndIndex);
          const [commandName, msgNumber] = (this._command || '').split(' ', 2);
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
          safeResolve();
          return;
        }
        const err =
        /**
         * @type {Error & {eventName: "bad-server-response"}}
         */
        new Error('Unexpected response');
        err.eventName = 'bad-server-response';
        safeReject(err);
      });
      this._socket.on('error', err => {
        err.eventName = 'error';
        if (this._stream) {
          this.emit('error', err);
          return;
        }
        safeReject(err);
        this._socket = null;
      });
      this._socket.once('close', () => {
        const err = /** @type {Error & {eventName: "close"}} */
        new Error('close');
        err.eventName = 'close';
        safeReject(err);
        this._socket = null;
      });
      this._socket.once('end', () => {
        const err = /** @type {Error & {eventName: "end"}} */
        new Error('end');
        err.eventName = 'end';
        safeReject(err);
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
   * @returns {Promise<[string, Readable|null]>}
   */
  async command(...args) {
    this._command = args.join(' ').trim();
    if (!this._hasActiveSocket()) {
      throw new Error('no-socket');
    }
    // eslint-disable-next-line promise/avoid-new -- Our own API
    await new Promise((
    // eslint-disable-next-line jsdoc/reject-any-type -- Promise API
    /** @type {(value?: any) => void} */
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
      /** @type {boolean} */
      let settled = false;

      /**
       * @returns {void}
       */
      const clear = () => {
        this.removeListener('error', rejectFn);
        this.removeListener('response', responseFn);
      };

      /**
       * @param {Error} err
       */
      const rejectFn = err => {
        if (settled) {
          return;
        }
        settled = true;
        clear();
        reject(err);
      };

      /**
       * @param {string} info
       * @param {Readable|null} stream
       * @returns {void}
       */
      const responseFn = (info, stream) => {
        if (settled) {
          return;
        }
        settled = true;
        clear();
        resolve([info, stream]);
      };
      this.once('error', rejectFn);
      this.once('response', responseFn);
      if (!this._hasActiveSocket()) {
        reject(new Error('no-socket'));
        return;
      }
      try {
        /** @type {Socket} */this._socket.write(`${this._command}${_constant.CRLF}`, 'utf8');
      } catch (err) {
        rejectFn(/** @type {Error} */err);
      }
    });
  }
}
var _default = exports.default = Pop3Connection;
module.exports = exports.default;
//# sourceMappingURL=Connection.cjs.map