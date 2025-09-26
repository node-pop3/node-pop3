import {Socket} from 'net';
import _tls from 'tls';
import {EventEmitter} from 'events';
import {Readable} from 'stream';

import {
  CRLF,
  CRLF_BUFFER,
  TERMINATOR_BUFFER,
  TERMINATOR_BUFFER_ARRAY,
  MULTI_LINE_COMMAND_NAME,
  MAYBE_MULTI_LINE_COMMAND_NAME
} from './constant.js';

/**
 * @typedef {number} Integer
 */

/* eslint-disable unicorn/prefer-event-target -- Should replace for browser */
/**
 *
 */
class Pop3Connection extends EventEmitter {
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
  constructor ({
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
  _updateStream () {
    this._stream = new Readable({
      read () {
        //
      }
    });
    return this._stream;
  }

  /**
   * @param {Buffer} buffer
   * @returns {void}
   */
  _pushStream (buffer) {
    if (TERMINATOR_BUFFER_ARRAY.some((_buffer) => _buffer.equals(buffer))) {
      this._endStream();
      return;
    }
    const endBuffer = buffer.subarray(-5);
    if (endBuffer.equals(TERMINATOR_BUFFER)) {
      /** @type {Readable} */ (this._stream).push(buffer.subarray(0, -5));
      this._endStream();
      return;
    }
    /** @type {Readable} */ (this._stream).push(buffer);
  }

  /**
   * @param {Error} [err]
   * @returns {void}
   */
  _endStream (err) {
    if (this._stream) {
      this._stream.push(null);
    }
    this._stream = null;
    this.emit('end', err);
  }

  /**
   * @returns {Promise<void>}
   */
  connect () {
    const {host, port, tlsOptions, servername} = this;
    const socket = new Socket();
    socket.setKeepAlive(true);
    // eslint-disable-next-line promise/avoid-new -- Our own API
    return new Promise((
      // eslint-disable-next-line jsdoc/reject-any-type -- Promise API
      /** @type {(val?: any) => void} */
      resolve,
      reject
    ) => {
      if (typeof this.timeout !== 'undefined') {
        socket.setTimeout(this.timeout, () => {
          const err = /** @type {Error & {eventName: "timeout"}} */ (
            new Error('timeout')
          );
          err.eventName = 'timeout';
          reject(err);
          if (this.listeners('end').length) {
            this.emit('end', err);
          }
          if (this.listeners('error').length) {
            this.emit('error', err);
          }
          /** @type {import('tls').TLSSocket} */ (this._socket).end();
          this._socket = null;

          if (this._stream) {
            this._stream.destroy();
          }
        });
      }
      if (this.tls) {
        const options = {host, port, socket, servername, ...tlsOptions};
        // @ts-expect-error Works
        this._socket = _tls.connect(options);
      } else {
        this._socket = socket;
      }

      this._socket.on(
        'data',
        /**
         * @param {Buffer} buffer
         * @returns {void}
         */
        (buffer) => {
          if (this._stream) {
            this._pushStream(buffer);
            return;
          }
          if (buffer[0] === 45) { // '-'
            const err =
              /**
               * @type {Error & {eventName: "error", command: string|undefined}}
               */ (
                // @ts-expect-error It's ok
                new Error(buffer.subarray(5, -2))
              );
            err.eventName = 'error';
            // https://github.com/node-pop3/node-pop3/issues/37
            err.command = this._command.startsWith('PASS ')
              ? 'PASS ***'
              : this._command;
            this.emit('error', err);
            return;
          }
          if (buffer[0] === 43) { // '+'
            const firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
            const infoBuffer = buffer.subarray(4, firstLineEndIndex);
            const [commandName, msgNumber] = (this._command || '').split(' ');
            let stream = null;
            if (MULTI_LINE_COMMAND_NAME.includes(commandName) ||
                (!msgNumber &&
                MAYBE_MULTI_LINE_COMMAND_NAME.includes(commandName))) {
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
             */ (
              new Error('Unexpected response')
            );
          err.eventName = 'bad-server-response';
          reject(err);
        }
      );
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
        const err = /** @type {Error & {eventName: "close"}} */ (
          new Error('close')
        );
        err.eventName = 'close';
        reject(err);
        this._socket = null;
      });
      this._socket.once('end', () => {
        const err = /** @type {Error & {eventName: "end"}} */ (
          new Error('end')
        );
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
  async command (...args) {
    this._command = args.join(' ').trim();
    if (!this._socket) {
      throw new Error('no-socket');
    }
    // eslint-disable-next-line promise/avoid-new -- Our own API
    await new Promise((
      // eslint-disable-next-line jsdoc/reject-any-type -- Promise API
      /** @type {(value?: any) => void} */
      resolve,
      reject
    ) => {
      if (!this._stream) {
        resolve();
        return;
      }
      this.once('error', (err) => {
        reject(err);
      });
      this.once('end', (err) => {
        return err ? reject(err) : resolve();
      });
    });

    // eslint-disable-next-line promise/avoid-new -- Our own API
    return new Promise((resolve, reject) => {
      /**
       * @param {Error} err
       */
      const rejectFn = (err) => reject(err);
      this.once('error', rejectFn);
      this.once('response', (info, stream) => {
        this.removeListener('error', rejectFn);
        resolve([info, stream]);
      });
      if (!this._socket) {
        reject(new Error('no-socket'));
      }
      /** @type {Socket} */ (
        this._socket
      ).write(`${this._command}${CRLF}`, 'utf8');
    });
  }
}

export default Pop3Connection;
