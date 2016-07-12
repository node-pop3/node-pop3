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

var _constant = require('./constant');

var Pop3Connection = (function (_EventEmitter) {
  _inherits(Pop3Connection, _EventEmitter);

  function Pop3Connection(_ref) {
    var host = _ref.host;
    var port = _ref.port;
    var tls = _ref.tls;

    _classCallCheck(this, Pop3Connection);

    _get(Object.getPrototypeOf(Pop3Connection.prototype), 'constructor', this).call(this);
    this.host = host;
    this.port = port;
    this.tls = tls;
    this._socket = null;
    this._stream = null;
    this._command;
  }

  _createClass(Pop3Connection, [{
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
      if (_constant.TERMINATOR_BUFFER_ARRAY.some(function (_buffer) {
        return _buffer.equals(buffer);
      })) {
        return this._endStream();
      }
      var endBuffer = buffer.slice(-5);
      if (endBuffer.equals(_constant.TERMINATOR_BUFFER)) {
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
    key: '_connect',
    value: function _connect() {
      var host = this.host;
      var port = this.port;
      var _queues = this._queues;
      var _addAsPromise = this._addAsPromise;

      var socket = new _net.Socket();
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self.tls) {
          self._socket = _tls2['default'].connect({
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
          self._socket = socket;
        }

        self._socket.on('data', function (buffer) {
          if (self._stream) {
            return self._pushStream(buffer);
          }
          if (buffer[0] === 45) {
            // '-'
            var err = new Error(buffer.slice(5, -2));
            err.eventName = 'error';
            err.command = self._command;
            return self.emit('error', err);
          }
          if (buffer[0] === 43) {
            // '+'
            var firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
            var infoBuffer = buffer.slice(4, firstLineEndIndex);
            var commandName = (self._command || '').split(' ')[0];
            var stream = null;
            if (_constant.MULTI_LINE_COMMAND_NAME.includes(commandName)) {
              self._updateStream();
              stream = self._stream;
              var bodyBuffer = buffer.slice(firstLineEndIndex + 2);
              if (bodyBuffer[0]) {
                self._pushStream(bodyBuffer);
              }
            }
            self.emit('response', infoBuffer.toString(), stream);
          }
          resolve();
        });
        self._socket.on('error', function (err) {
          err.eventName = 'error';
          if (self._stream) {
            return self.emit('error', err);
          }
          reject(err);
        });
        self._socket.once('closed', function () {
          self._socket.destroy();
          var err = new Error('closed');
          err.eventName = 'closed';
          reject(err);
          self._socket = null;
        });
        self._socket.once('end', function () {
          self._socket.destroy();
          var err = new Error('end');
          err.eventName = 'end';
          reject(err);
          self._socket = null;
        });
        socket.connect({
          host: host,
          port: port
        });
      });
    }
  }, {
    key: 'command',
    value: function command() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._command = args.join(' ');
      var self = this;
      return new Promise(function (resolve, reject) {
        if (!self._stream) {
          return resolve();
        }
        self.once('end', function (err) {
          return err ? reject(err) : resolve();
        });
      }).then(function () {
        return new Promise(function (resolve, reject) {
          var rejectFn = function rejectFn(err) {
            return reject(err);
          };
          self.once('error', rejectFn);
          self.once('response', function (info, stream) {
            self.removeListener('error', rejectFn);
            console.log('command:', self._command);
            resolve([info, stream]);
          });
          self._socket.write('' + self._command + _constant.CRLF, 'utf8');
        });
      });
    }
  }]);

  return Pop3Connection;
})(_events.EventEmitter);

exports['default'] = Pop3Connection;
module.exports = exports['default'];