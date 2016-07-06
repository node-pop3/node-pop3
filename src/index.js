import { Socket } from 'net';
import tls from 'tls';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

const CRLF = '\r\n';
const CRLF_BUFFER = new Buffer('\r\n');
const TERMINATOR_BUFFER = new Buffer('\r\n.\r\n');
const TERMINATOR_BUFFER_ARRAY = [
  new Buffer('\r\n.\r\n'),
  new Buffer('.\r\n'),
];

const multiLineCommendName = [
  'LIST',
  'RETR',
  'TOP',
  'UIDL',
];

class Pop3Client extends EventEmitter {
  
  constructor({
    host,
    port,
    tls,
  }) {
    super();
    this.host = host;
    this.port = port;
    this.tls = tls;
    this._socket;
    this._stream = null;
    this._commend;
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
    this._stream.push(null);
    this._stream = null;
    this.emit('end', err);
  }

  connect() {
    const { host, port, _queues, _addAsPromise } = this;
    const socket = new Socket();
    const that = this;
    return new Promise((resolve, reject) => {
      if (that.tls) {
        that._socket = tls.connect({
          host,
          port,
          socket,
        }, () => console.log(`Connect to ${host}:${port} via tls`));
      } else {
        socket.once('connect', () => console.log(`Connect to ${host}:${port}`));
        that._socket = socket;
      }

      that._socket.on('data', (buffer) => {
        //console.log('@@@@@@@@@', buffer.toString());
        if (that._stream) {
          return that._pushStream(buffer);
        }
        if (buffer[0] === 45) {// '-'
          let errMessage = that._commend
            ? `commend: ${that._commend} `
            : '';
          errMessage += `errMessage: ${buffer.slice(5, -2)}`;
          return that.emit('error', { type: 'response', err: new Error(errMessage) });
        }
        if (buffer[0] === 43) {// '+'
          const firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
          const infoBuffer = buffer.slice(4, firstLineEndIndex);
          const commendName = (that._commend || '').split(' ')[0];
          let stream = null;
          if (multiLineCommendName.includes(commendName)) {
            that._updateStream();
            stream = that._stream;
            const bodyBuffer = buffer.slice(firstLineEndIndex + 2);
            if (bodyBuffer[0]) {
              that._pushStream(bodyBuffer);
            }
          }
          that.emit('response', infoBuffer.toString(), stream);
        }
        resolve();
      });
      that._socket.on('error', (err) => {
        if (that._stream) {
          return that.emit('error', { type: 'response', err });
        }
        reject({ type: 'error', err })
      });
      that._socket.once('closed', () => that._socket.destroy() && reject({ type: 'closed' }));
      that._socket.once('end', () => that._socket.destroy() && reject({ type: 'end' }));
      socket.connect({
        host,
        port,
      });
    });
  }

  commend(...args) {
    this._commend = args.join(' ');
    const that = this;
    return new Promise((resolve, reject) => {
      if (!that._stream) {
        return resolve();
      }
      that.once('end', (err) => {
        return err ? reject(err) : resolve();
      });
    }).then(() => new Promise((resolve, reject) => {
      const rejectFn = (err) => reject(err);
      that.once('error', rejectFn);
      that.once('response', (info, stream) => {
        that.removeListener('error', rejectFn);
        console.log('commend:', that._commend);
        resolve([info, stream]);
      });
      that._socket.write(`${that._commend}${CRLF}`, 'utf8');
    }));
  }
}

export default Pop3Client;

/*
//const [host, port, tlsBool] = ['outlook.office365.com', '995', true];
//const [host, port, tlsBool] = ['mail.ximalaya.com', '110', false];
const [host, port, tlsBool] = ['pop.exmail.qq.com', '995', true];
const pop3Client = new Pop3Client({ host, port, tls: tlsBool });
pop3Client.connect()
//.then(() => pop3Client.commend('USER', 'guoxing@trymoka.onmicrosoft.com'))
//.then(() => pop3Client.commend('USER', 'recruit_hr@ximalaya.com'))
.then(() => pop3Client.commend('USER', 'test@trymoka.com'))
.then(([info]) => console.log('info:', info))
//.then(() => pop3Client.commend('PASS', 'moka@2015'))
.then(() => pop3Client.commend('PASS', 'moka@2015'))
.then(([info]) => console.log('info:', info))
.then(() => pop3Client.commend('STAT'))
.then(([info]) => console.log('info:', info))
//.then(() => pop3Client.commend('DELE', 75))
.then(() => pop3Client.commend('LIST'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Client.commend('UIDL'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Client.commend('RETR', 23))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Client.commend('QUIT'))
.then(([info]) => console.log(info))
.catch((err) => console.log(err));*/
