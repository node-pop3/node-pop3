import Pop3Connection from './Connection';

import { stream2String, listify } from './helper';

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

  _connect() {
    if (this._socket) {
      return Promise.resolve(this._PASSInfo);
    }
    return super.connect()
      .then(() => super.command('USER', this.user))
      .then(() => super.command('PASS', this.password))
      .then(([info]) => this._PASSInfo = info);
  }

  UIDL(msgNumber = '') {
    return this._connect()
      .then(() => super.command('UIDL', msgNumber))
      .then(([, stream]) => stream2String(stream))
      .then(listify);
  }

  RETR(msgNumber) {
    return this._connect()
      .then(() => super.command('RETR', msgNumber))
      .then(([, stream]) => stream);
  }

  TOP(msgNumber, n = 0) {
    return this._connect()
      .then(() => super.command('TOP', msgNumber, n))
      .then(([, stream]) => stream2String(stream));
  }

  QUIT() {
    if (!this._socket) {
      return Promise.resolve(this._PASSInfo = '' || 'Bye');
    }
    return super.command('QUIT')
      .then(([info]) => this._PASSInfo = '' || info);
  }

}

export default Pop3Command;
