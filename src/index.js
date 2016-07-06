import { Socket } from 'net';
import tls from 'tls';

import iconv from 'iconv-lite';

const CRLF = '\r\n';

class Pop3Client {
  
  constructor({
    host,
    port,
    tls,
  }) {
    this.host = host;
    this.port = port;
    this.tls = tls;
    this._socket;
    this._queues;
    this._promise;
    this._onBody;
    this._onQueue = this._onQueue.bind(this);
    this._handleResponse = this._handleResponse.bind(this);
  }

  _handleError(errMessage) {
    this._onError = true;

  }

  _handleResponse(buffer) {
    if (!this._onBody) {
      if (buffer[0] === 43) { // '+'
        
      } else if (buffer[0] === 45) { // '-'
        return this._handleError(buffer.slice(5));
      }
    } else {
      
    }
  }

  _onQueue(buffer) {
    console.log(buffer[0], buffer.toString());
    const queue = this._queues.shift()
      || [(_buffer) => _buffer];
    const startFn = queue.shift();
    this._promise = (this._promise
      || Promise.resolve())
      .then(() => startFn(buffer));
    for (const fn of queue) {
      this._promise = fn.isCatchFn
        ? this._promise.catch(fn)
        : this._promise.then(fn);
    }
  }

  connect() {
    const { host, port, _queues, _addAsPromise } = this;
    const socket = new Socket();
    const that = this;
    if (this.tls) {
      this._socket = tls.connect({
        host,
        port,
        socket,
      }, () => console.log(`Connect to ${host}:${port} via tls`))
    } else {
      socket.once('connect', () => {
        console.log(`Connect to ${host}:${port}`);
      })
      this._socket = socket;
    }
    //this._socket.on('readable', () => console.log(socket.read(), 'here'));
    this._socket.on('data', (buffer) => this._onQueue(buffer));
    socket.on('error', (err) => that.reject({ type: 'error', err }));
    socket.once('closed', () => that._socket.destroy() && that.reject({ type: 'closed' }));
    socket.once('end', () => that._socket.destroy() && that.reject({ type: 'end' }));
    this._queues = [[(buffer) => buffer]];
    this._promise = Promise.resolve(socket.connect({
      host,
      port,
    }));
    return this;
  }

  reject(err) {
    console.log(err);
  }

  _addFn(fn) {
    fn = fn.bind(this);
    const queue = this._queues[this._queues.length - 1];
    if (!queue) {
      if (this._promise) {
        this._promise = this._promise.then(fn).catch((err) => console.log(err));
      } else {
        this._promise = Promise.resolve(fn());
      }
    } else {
      queue.push(fn);
    }
    return this;
  }

  then(fn) {
    return this._addFn(fn);
  }

  catch(fn) {
    fn.isCatchFn = true;
    return this._addFn(fn);
  }

  commend(...args) {
    const fn = () => {
      console.log(`commend:${args[0]}`);
      return this._socket.write(`${args.join(' ')}${CRLF}`, 'utf8');
    };
    this._addFn(fn);
    this._queues.push([(buffer) => buffer]);
    return;
  }

}

const [host, port, tlsBool] = ['pop.exmail.qq.com', '995', true];
const pop3Client = new Pop3Client({ host, port, tls: tlsBool });
pop3Client.connect()
.then(() => pop3Client.commend('USER', 'hello@trymoka.com'))
.then(() => pop3Client.commend('PASS', 'moka@2015'))
.then(() => pop3Client.commend('STAT'))
//.then(() => pop3Client.commend('DELE', 75))
//.then(() => pop3Client.commend('LIST'))
//.then(() => pop3Client.commend('UIDL'))
//.then(() => pop3Client.commend('RETR', 95))
.then(() => pop3Client.commend('QUIT'))
.catch((err) => console.log(err));
