"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _net = require("net");

var _tls2 = _interopRequireDefault(require("tls"));

var _events = require("events");

var _stream = require("stream");

var _constant = require("./constant");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Pop3Connection = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Pop3Connection, _EventEmitter);

  function Pop3Connection(_ref) {
    var _this;

    var host = _ref.host,
        port = _ref.port,
        tls = _ref.tls,
        timeout = _ref.timeout;

    _classCallCheck(this, Pop3Connection);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Pop3Connection).call(this));
    _this.host = host;
    _this.port = port || 110;
    _this.tls = tls;
    _this.timeout = timeout;
    _this._socket = null;
    _this._stream = null;
    _this._command;
    return _this;
  }

  _createClass(Pop3Connection, [{
    key: "_updateStream",
    value: function _updateStream() {
      this._stream = new _stream.Readable({
        read: function read() {}
      });
      return this._stream;
    }
  }, {
    key: "_pushStream",
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
    key: "_endStream",
    value: function _endStream(err) {
      this._stream.push(null);

      this._stream = null;
      this.emit('end', err);
    }
  }, {
    key: "connect",
    value: function connect() {
      var _this2 = this;

      var host = this.host,
          port = this.port;
      var socket = new _net.Socket();
      socket.setKeepAlive(true);
      return new Promise(function (resolve, reject) {
        if (typeof _this2.timeout !== 'undefined') {
          socket.setTimeout(_this2.timeout, function () {
            var err = new Error('timeout');
            err.eventName = 'timeout';
            reject(err);

            if (_this2.listeners('end').length) {
              _this2.emit('end', err);
            }

            if (_this2.listeners('error').length) {
              _this2.emit('error', err);
            }

            _this2._socket.end();

            _this2._socket = null;
          });
        }

        if (_this2.tls) {
          _this2._socket = _tls2["default"].connect({
            host: host,
            port: port,
            socket: socket
          });
        } else {
          _this2._socket = socket;
        }

        _this2._socket.on('data', function (buffer) {
          if (_this2._stream) {
            return _this2._pushStream(buffer);
          }

          if (buffer[0] === 45) {
            // '-'
            var err = new Error(buffer.slice(5, -2));
            err.eventName = 'error';
            err.command = _this2._command;
            return _this2.emit('error', err);
          }

          if (buffer[0] === 43) {
            // '+'
            var firstLineEndIndex = buffer.indexOf(_constant.CRLF_BUFFER);
            var infoBuffer = buffer.slice(4, firstLineEndIndex);

            var _split = (_this2._command || '').split(' '),
                _split2 = _slicedToArray(_split, 1),
                commandName = _split2[0];

            var stream = null;

            if (_constant.MULTI_LINE_COMMAND_NAME.includes(commandName)) {
              _this2._updateStream();

              stream = _this2._stream;
              var bodyBuffer = buffer.slice(firstLineEndIndex + 2);

              if (bodyBuffer[0]) {
                _this2._pushStream(bodyBuffer);
              }
            }

            _this2.emit('response', infoBuffer.toString(), stream);
          }

          resolve();
        });

        _this2._socket.on('error', function (err) {
          err.eventName = 'error';

          if (_this2._stream) {
            return _this2.emit('error', err);
          }

          reject(err);
        });

        _this2._socket.once('close', function () {
          var err = new Error('close');
          err.eventName = 'close';
          reject(err);
          _this2._socket = null;
        });

        _this2._socket.once('end', function () {
          var err = new Error('end');
          err.eventName = 'end';
          reject(err);
          _this2._socket = null;
        });

        socket.connect({
          host: host,
          port: port
        });
      });
    }
  }, {
    key: "command",
    value: function () {
      var _command = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this3 = this;

        var _len,
            args,
            _key,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = _args[_key];
                }

                this._command = args.join(' ');
                _context.next = 4;
                return new Promise(function (resolve, reject) {
                  if (!_this3._stream) {
                    return resolve();
                  }

                  _this3.once('end', function (err) {
                    return err ? reject(err) : resolve();
                  });
                });

              case 4:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var rejectFn = function rejectFn(err) {
                    return reject(err);
                  };

                  _this3.once('error', rejectFn);

                  _this3.once('response', function (info, stream) {
                    _this3.removeListener('error', rejectFn);

                    resolve([info, stream]);
                  });

                  _this3._socket.write("".concat(_this3._command).concat(_constant.CRLF), 'utf8');
                }));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function command() {
        return _command.apply(this, arguments);
      }

      return command;
    }()
  }]);

  return Pop3Connection;
}(_events.EventEmitter);

var _default = Pop3Connection;
exports["default"] = _default;
//# sourceMappingURL=Connection.js.map