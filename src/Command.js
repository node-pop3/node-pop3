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
    if (super._socket) {
      return Promise.resolve(this._PASSInfo);
    }
    const self = this;
    return super._connect()
      .then(() => super.command('USER', self.user))
      .then(() => super.command('PASS', self.password))
      .then(([info]) => self._PASSInfo = info);
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
    const self = this;
    return super.command('QUIT')
      .then(([info]) => self._PASSInfo = '' || info);
  }

  static listify(str) {
    return str.split(CRLF)
      .filter((line) => line)
      .map((line) => line.split(' '));
  }

}

export default Pop3Command;

/*
//const [host, port, tlsBool] = ['outlook.office365.com', '995', true];
//const [host, port, tlsBool] = ['mail.ximalaya.com', '110', false];
const [host, port, tlsBool] = ['pop.exmail.qq.com', '995', true];
//const pop3Lib = new Pop3Command({ host, port, tls: tlsBool, user: 'recruit_hr@ximalaya.com', password: 'recruit123456' });
const pop3Lib = new Pop3Command({ host, port, tls: tlsBool, user: 'test@trymoka.com', password: 'moka@2015' });
pop3Lib.RETR(23)
.then((stream) => stream.on('data', (buffer) => console.log(buffer.toString())));*/
//.then(() => pop3Lib.QUIT());
/*
//.then(() => pop3Lib.command('USER', 'guoxing@trymoka.onmicrosoft.com'))
//.then(() => pop3Lib.command('USER', 'recruit_hr@ximalaya.com'))
//.then(() => pop3Lib.command('USER', 'test@trymoka.com'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('PASS', 'moka@2015'))
//.then(() => pop3Lib.command('PASS', 'moka@2015'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('STAT'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('DELE', 75))
.then(() => pop3Lib.command('LIST'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})*
.then(() => pop3Lib.command('UIDL'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Lib.command('RETR', 1))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Lib.command('QUIT'))
.then(([info]) => console.log(info))
.catch((err) => console.log(err));*/
