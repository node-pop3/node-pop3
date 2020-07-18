import Pop3Connection from './Connection';

import { stream2String, listify } from './helper';

export { stream2String, listify };

class Pop3Command extends Pop3Connection {
  constructor({
    user,
    password,
    host,
    port,
    tls,
    timeout,
  }) {
    super({ host, port, tls, timeout });
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
    const str = await stream2String(stream);
    return listify(str);
  }

  async RETR(msgNumber) {
    await this._connect();
    const [, stream] = await super.command('RETR', msgNumber);
    return stream;
  }

  async TOP(msgNumber, n = 0) {
    await this._connect();
    const [, stream] = await super.command('TOP', msgNumber, n);
    return stream2String(stream);
  }

  async QUIT() {
    if (!this._socket) {
      this._PASSInfo = '' || 'Bye';
      return this._PASSInfo;
    }
    const [info] = await super.command('QUIT');
    this._PASSInfo = '' || info;
    return this._PASSInfo;
  }
}

export default Pop3Command;
