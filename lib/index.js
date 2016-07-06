'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _net = require('net');

var _tls = require('tls');

var _tls2 = _interopRequireDefault(_tls);

var _events = require('events');

var _stream = require('stream');

var CRLF = '\r\n';
var CRLF_BUFFER = new Buffer('\r\n');
var TERMINATOR_BUFFER = new Buffer('\r\n.\r\n');
var TERMINATOR_BUFFER_ARRAY = [new Buffer('\r\n.\r\n'), new Buffer('.\r\n')];

var multiLineCommendName = ['LIST', 'RETR', 'TOP', 'UIDL'];

var Pop3Client = (function (_EventEmitter) {
  _inherits(Pop3Client, _EventEmitter);

  function Pop3Client(_ref) {
    var host = _ref.host;
    var port = _ref.port;
    var tls = _ref.tls;

    _classCallCheck(this, Pop3Client);

    _get(Object.getPrototypeOf(Pop3Client.prototype), 'constructor', this).call(this);
    this.host = host;
    this.port = port;
    this.tls = tls;
    this._socket;
    this._stream = null;
    this._commend;
  }

  _createClass(Pop3Client, [{
    key: '_updateStream',
    value: function _updateStream() {
      this._stream = new _stream.Readable({
        read: function read() {}
      });
      return this._stream;
    }
  }, {
    key: '_pushStream',
    value: function _pushStream(buffer) {
      if (TERMINATOR_BUFFER_ARRAY.some(function (_buffer) {
        return _buffer.equals(buffer);
      })) {
        return this._endStream();
      }
      var endBuffer = buffer.slice(-5);
      if (endBuffer.equals(TERMINATOR_BUFFER)) {
        this._stream.push(buffer.slice(0, -5));
        return this._endStream();
      }
      this._stream.push(buffer);
    }
  }, {
    key: '_endStream',
    value: function _endStream(err) {
      this._stream.push(null);
      this._stream = null;
      this.emit('end', err);
    }
  }, {
    key: 'connect',
    value: function connect() {
      var host = this.host;
      var port = this.port;
      var _queues = this._queues;
      var _addAsPromise = this._addAsPromise;

      var socket = new _net.Socket();
      var that = this;
      return new Promise(function (resolve, reject) {
        if (that.tls) {
          that._socket = _tls2['default'].connect({
            host: host,
            port: port,
            socket: socket
          }, function () {
            return console.log('Connect to ' + host + ':' + port + ' via tls');
          });
        } else {
          socket.once('connect', function () {
            return console.log('Connect to ' + host + ':' + port);
          });
          that._socket = socket;
        }

        that._socket.on('data', function (buffer) {
          //console.log('@@@@@@@@@', buffer.toString());
          if (that._stream) {
            return that._pushStream(buffer);
          }
          if (buffer[0] === 45) {
            // '-'
            var errMessage = that._commend ? 'commend: ' + that._commend + ' ' : '';
            errMessage += 'errMessage: ' + buffer.slice(5, -2);
            return that.emit('error', { type: 'response', err: new Error(errMessage) });
          }
          if (buffer[0] === 43) {
            // '+'
            var firstLineEndIndex = buffer.indexOf(CRLF_BUFFER);
            var infoBuffer = buffer.slice(4, firstLineEndIndex);
            var commendName = (that._commend || '').split(' ')[0];
            var stream = null;
            if (multiLineCommendName.includes(commendName)) {
              that._updateStream();
              stream = that._stream;
              var bodyBuffer = buffer.slice(firstLineEndIndex + 2);
              if (bodyBuffer[0]) {
                that._pushStream(bodyBuffer);
              }
            }
            that.emit('response', infoBuffer.toString(), stream);
          }
          resolve();
        });
        that._socket.on('error', function (err) {
          if (that._stream) {
            return that.emit('error', { type: 'response', err: err });
          }
          reject({ type: 'error', err: err });
        });
        that._socket.once('closed', function () {
          return that._socket.destroy() && reject({ type: 'closed' });
        });
        that._socket.once('end', function () {
          return that._socket.destroy() && reject({ type: 'end' });
        });
        socket.connect({
          host: host,
          port: port
        });
      });
    }
  }, {
    key: 'commend',
    value: function commend() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._commend = args.join(' ');
      var that = this;
      return new Promise(function (resolve, reject) {
        if (!that._stream) {
          return resolve();
        }
        that.once('end', function (err) {
          return err ? reject(err) : resolve();
        });
      }).then(function () {
        return new Promise(function (resolve, reject) {
          var rejectFn = function rejectFn(err) {
            return reject(err);
          };
          that.once('error', rejectFn);
          that.once('response', function (info, stream) {
            that.removeListener('error', rejectFn);
            console.log('commend:', that._commend);
            resolve([info, stream]);
          });
          that._socket.write('' + that._commend + CRLF, 'utf8');
        });
      });
    }
  }]);

  return Pop3Client;
})(_events.EventEmitter);

exports['default'] = Pop3Client;

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
module.exports = exports['default'];