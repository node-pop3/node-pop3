"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Connection = _interopRequireDefault(require("./Connection"));

var _helper = require("./helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Pop3Command = /*#__PURE__*/function (_Pop3Connection) {
  _inherits(Pop3Command, _Pop3Connection);

  function Pop3Command(_ref) {
    var _this;

    var user = _ref.user,
        password = _ref.password,
        host = _ref.host,
        port = _ref.port,
        tls = _ref.tls,
        timeout = _ref.timeout;

    _classCallCheck(this, Pop3Command);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Pop3Command).call(this, {
      host: host,
      port: port,
      tls: tls,
      timeout: timeout
    }));
    _this.user = user;
    _this.password = password;
    _this._PASSInfo = '';
    return _this;
  }

  _createClass(Pop3Command, [{
    key: "_connect",
    value: function () {
      var _connect2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _ref2, _ref3, info;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this._socket) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this._PASSInfo);

              case 2:
                console.log('1111');
                _context.next = 5;
                return _get(_getPrototypeOf(Pop3Command.prototype), "connect", this).call(this);

              case 5:
                console.log('22222');
                _context.next = 8;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'USER', this.user);

              case 8:
                console.log('3333');
                _context.next = 11;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'PASS', this.password);

              case 11:
                _ref2 = _context.sent;
                _ref3 = _slicedToArray(_ref2, 1);
                info = _ref3[0];
                console.log('444');
                this._PASSInfo = info;
                return _context.abrupt("return", this._PASSInfo);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _connect() {
        return _connect2.apply(this, arguments);
      }

      return _connect;
    }()
  }, {
    key: "UIDL",
    value: function () {
      var _UIDL = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var msgNumber,
            _ref4,
            _ref5,
            stream,
            str,
            _args2 = arguments;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                msgNumber = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : '';
                _context2.next = 3;
                return this._connect();

              case 3:
                _context2.next = 5;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'UIDL', msgNumber);

              case 5:
                _ref4 = _context2.sent;
                _ref5 = _slicedToArray(_ref4, 2);
                stream = _ref5[1];
                _context2.next = 10;
                return (0, _helper.stream2String)(stream);

              case 10:
                str = _context2.sent;
                return _context2.abrupt("return", (0, _helper.listify)(str));

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function UIDL() {
        return _UIDL.apply(this, arguments);
      }

      return UIDL;
    }()
  }, {
    key: "RETR",
    value: function () {
      var _RETR = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(msgNumber) {
        var _ref6, _ref7, stream;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._connect();

              case 2:
                _context3.next = 4;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'RETR', msgNumber);

              case 4:
                _ref6 = _context3.sent;
                _ref7 = _slicedToArray(_ref6, 2);
                stream = _ref7[1];
                return _context3.abrupt("return", stream);

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function RETR(_x) {
        return _RETR.apply(this, arguments);
      }

      return RETR;
    }()
  }, {
    key: "TOP",
    value: function () {
      var _TOP = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(msgNumber) {
        var n,
            _ref8,
            _ref9,
            stream,
            _args4 = arguments;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                n = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 0;
                _context4.next = 3;
                return this._connect();

              case 3:
                _context4.next = 5;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'TOP', msgNumber, n);

              case 5:
                _ref8 = _context4.sent;
                _ref9 = _slicedToArray(_ref8, 2);
                stream = _ref9[1];
                return _context4.abrupt("return", (0, _helper.stream2String)(stream));

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function TOP(_x2) {
        return _TOP.apply(this, arguments);
      }

      return TOP;
    }()
  }, {
    key: "QUIT",
    value: function () {
      var _QUIT = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _ref10, _ref11, info;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this._socket) {
                  _context5.next = 3;
                  break;
                }

                this._PASSInfo = '' || 'Bye';
                return _context5.abrupt("return", this._PASSInfo);

              case 3:
                _context5.next = 5;
                return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'QUIT');

              case 5:
                _ref10 = _context5.sent;
                _ref11 = _slicedToArray(_ref10, 1);
                info = _ref11[0];
                this._PASSInfo = '' || info;
                return _context5.abrupt("return", this._PASSInfo);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function QUIT() {
        return _QUIT.apply(this, arguments);
      }

      return QUIT;
    }()
  }]);

  return Pop3Command;
}(_Connection["default"]);

var _default = Pop3Command;
exports["default"] = _default;
//# sourceMappingURL=Command.js.map