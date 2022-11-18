"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Connection = _interopRequireDefault(require("./Connection.cjs"));
var _helper = require("./helper.cjs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Pop3Command extends _Connection.default {
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
  async UIDL(msgNumber = '') {
    await this._connect();
    const [, stream] = await super.command('UIDL', msgNumber);
    const str = await (0, _helper.stream2String)(stream);
    const list = (0, _helper.listify)(str);
    return msgNumber ? list[0] : list;
  }
  async NOOP() {
    await this._connect();
    await super.command('NOOP');
    return;
  }
  async LIST(msgNumber = '') {
    await this._connect();
    const [, stream] = await super.command('LIST', msgNumber);
    const str = await (0, _helper.stream2String)(stream);
    const list = (0, _helper.listify)(str);
    return msgNumber ? list[0] : list;
  }
  async RSET() {
    await this._connect();
    const [info] = await super.command('RSET');
    return info;
  }
  async RETR(msgNumber) {
    await this._connect();
    const [, stream] = await super.command('RETR', msgNumber);
    return (0, _helper.stream2String)(stream);
  }
  async DELE(msgNumber) {
    await this._connect();
    const [info] = await super.command('DELE', msgNumber);
    return info;
  }
  async STAT() {
    await this._connect();
    const [info] = await super.command('STAT');
    return info;
  }
  async TOP(msgNumber, n = 0) {
    await this._connect();
    const [, stream] = await super.command('TOP', msgNumber, n);
    return (0, _helper.stream2String)(stream);
  }
  async QUIT() {
    if (!this._socket) {
      this._PASSInfo = '' || 'Bye';
      return this._PASSInfo;
    }
    const [info] = await super.command('QUIT');
    this._PASSInfo = info || '';
    return this._PASSInfo;
  }
}
Pop3Command.stream2String = _helper.stream2String;
Pop3Command.listify = _helper.listify;
var _default = Pop3Command;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Command.cjs.map