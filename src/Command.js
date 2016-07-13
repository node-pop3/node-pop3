import Pop3Connection from './Connection';

import { CRLF } from './constant';

class Pop3Command extends Pop3Connection {

  constructor({
    user,
    password,
    host,
    port,
    tls,
  }) {
    super({ host, port, tls });
    this.user = user;
    this.password = password;
    this._PASSInfo = '';
  }

  connect() {
    if (this._socket) {
      return Promise.resolve(this._PASSInfo);
    }
    return super._connect()
      .then(() => super.command('USER', this.user))
      .then(() => super.command('PASS', this.password))
      .then(([info]) => this._PASSInfo = info);
  }

  UIDL(msgNumber = '') {
    return this.connect()
      .then(() => super.command('UIDL', msgNumber))
      .then(([, stream]) => new Promise((resolve) => {
        let buffer = Buffer.concat([]);
        let length = buffer.length;
        stream.on('data', (_buffer) => {
          length += _buffer.length;
          buffer = Buffer.concat([buffer, _buffer], length);
        });
        stream.on('end', () => resolve(Pop3Command.listify(buffer.toString())));
      }));
  }

  RETR(msgNumber) {
    return this.connect()
      .then(() => super.command('RETR', msgNumber))
      .then(([, stream]) => stream);
  }

  QUIT() {
    if (!this._socket) {
      return Promise.resolve(this._PASSInfo = '' || 'Bye');
    }
    return super.command('QUIT')
      .then(([info]) => this._PASSInfo = '' || info);
  }

  static listify(str) {
    return str.split(CRLF)
      .filter((line) => line)
      .map((line) => line.split(' '));
  }

}

export default Pop3Command;
