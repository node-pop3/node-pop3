"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Connection = _interopRequireDefault(require("./Connection.cjs"));
var _helper = require("./helper.cjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @typedef {number} Integer
 */

/**
 *
 */
class Pop3Command extends _Connection.default {
  /**
   * @param {{
   *   user: string,
   *   password: string,
   *   host: string,
   *   port?: Integer,
   *   tls?: boolean,
   *   timeout?: Integer,
   *   tlsOptions?: import('tls').TlsOptions,
   *   servername?: string
   * }} cfg
   */
  constructor({
    user,
    password,
    host,
    port,
    tls,
    timeout,
    tlsOptions,
    servername
  }) {
    super({
      host,
      port,
      tls,
      timeout,
      tlsOptions,
      servername
    });
    this.user = user;
    this.password = password;
    this._PASSInfo = '';
  }

  /**
   * @returns {Promise<string>}
   */
  async _connect() {
    if (this._socket) {
      return this._PASSInfo;
    }
    await super.connect();
    await super.command('USER', this.user);
    const [info] = await super.command('PASS', this.password);
    this._PASSInfo = info;
    return this._PASSInfo;
  }

  /**
   * @param {Integer|string} msgNumber
   * @returns {Promise<string[][]|string[]>}
   */
  async UIDL(msgNumber = '') {
    await this._connect();
    const [info, stream] = await super.command('UIDL', msgNumber);
    if (msgNumber) {
      return (0, _helper.listify)(info)[0];
    }
    const str = await (0, _helper.stream2String)(stream);
    return (0, _helper.listify)(str);
  }

  /**
   * @returns {Promise<void>}
   */
  async NOOP() {
    await this._connect();
    await super.command('NOOP');
  }

  /**
   * @param {Integer|string} msgNumber
   * @returns {Promise<string[][]|string[]>}
   */
  async LIST(msgNumber = '') {
    await this._connect();
    const [info, stream] = await super.command('LIST', msgNumber);
    if (msgNumber) {
      return (0, _helper.listify)(info)[0];
    }
    const str = await (0, _helper.stream2String)(stream);
    return (0, _helper.listify)(str);
  }

  /**
   * @returns {Promise<string>}
   */
  async RSET() {
    await this._connect();
    const [info] = await super.command('RSET');
    return info;
  }

  /**
   * @param {Integer} msgNumber
   * @returns {Promise<string>}
   */
  async RETR(msgNumber) {
    await this._connect();
    const [, stream] = await super.command('RETR', msgNumber);
    return (0, _helper.stream2String)(stream);
  }

  /**
   * @param {Integer} msgNumber
   * @returns {Promise<string>}
   */
  async DELE(msgNumber) {
    await this._connect();
    const [info] = await super.command('DELE', msgNumber);
    return info;
  }

  /**
   * @returns {Promise<string>}
   */
  async STAT() {
    await this._connect();
    const [info] = await super.command('STAT');
    return info;
  }

  /**
   * @returns {Promise<string>}
   */
  async LAST() {
    await this._connect();
    const [info] = await super.command('LAST');
    /* c8 ignore next 2 */
    // May fail depending on test server
    return info;
  }

  /**
   * @param {Integer} msgNumber
   * @param {Integer} numLines
   * @returns {Promise<string>}
   */
  async TOP(msgNumber, numLines = 0) {
    await this._connect();
    const [, stream] = await super.command('TOP', msgNumber, numLines);
    return (0, _helper.stream2String)(stream);
  }

  /**
   * @returns {Promise<string>}
   */
  async QUIT() {
    if (!this._socket) {
      this._PASSInfo = 'Bye';
      return this._PASSInfo;
    }
    const [info] = await super.command('QUIT');
    this._PASSInfo = info || '';
    return this._PASSInfo;
  }
}
Pop3Command.stream2String = _helper.stream2String;
Pop3Command.listify = _helper.listify;
var _default = exports.default = Pop3Command;
module.exports = exports.default;
//# sourceMappingURL=Command.cjs.map