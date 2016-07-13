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
    this.port = port || 110;
    this.tls = tls || false;
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
      var _this = this;

      var host = this.host;
      var port = this.port;
      var _queues = this._queues;
      var _addAsPromise = this._addAsPromise;

      var socket = new _net.Socket();
      socket.setKeepAlive(true);
      return new Promise(function (resolve, reject) {
        if (_this.tls) {
          _this._socket = _tls2['default'].connect({
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
          _this._socket = socket;
        }

        _this._socket.on('data', function (buffer) {
          if (_this._stream) {
            return _this._pushStream(buffer);
          }
          if (buffer[0] === 45) {
            // '-'
            var err = new Error(buffer.slice(5, -2));
            err.eventName = 'error';
            err.command = _this._command;
            return _this.emit('error', err);
          }
          if (buffer[0] === 43) {
            // '+'
            var firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
            var infoBuffer = buffer.slice(4, firstLineEndIndex);
            var commandName = (_this._command || '').split(' ')[0];
            var stream = null;
            if (_constant.MULTI_LINE_COMMAND_NAME.includes(commandName)) {
              _this._updateStream();
              stream = _this._stream;
              var bodyBuffer = buffer.slice(firstLineEndIndex + 2);
              if (bodyBuffer[0]) {
                _this._pushStream(bodyBuffer);
              }
            }
            _this.emit('response', infoBuffer.toString(), stream);
          }
          resolve();
        });
        _this._socket.on('error', function (err) {
          err.eventName = 'error';
          if (_this._stream) {
            return _this.emit('error', err);
          }
          reject(err);
        });
        _this._socket.once('close', function () {
          var err = new Error('close');
          err.eventName = 'close';
          reject(err);
          _this._socket = null;
        });
        _this._socket.once('end', function () {
          var err = new Error('end');
          err.eventName = 'end';
          reject(err);
          _this._socket = null;
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
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._command = args.join(' ');
      return new Promise(function (resolve, reject) {
        if (!_this2._stream) {
          return resolve();
        }
        _this2.once('end', function (err) {
          return err ? reject(err) : resolve();
        });
      }).then(function () {
        return new Promise(function (resolve, reject) {
          var rejectFn = function rejectFn(err) {
            return reject(err);
          };
          _this2.once('error', rejectFn);
          _this2.once('response', function (info, stream) {
            _this2.removeListener('error', rejectFn);
            resolve([info, stream]);
          });
          _this2._socket.write('' + _this2._command + _constant.CRLF, 'utf8');
        });
      });
    }
  }]);

  return Pop3Connection;
})(_events.EventEmitter);

exports['default'] = Pop3Connection;
module.exports = exports['default'];