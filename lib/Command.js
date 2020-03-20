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
    value: function _connect() {
      var _this2 = this;

      if (this._socket) {
        return Promise.resolve(this._PASSInfo);
      }

      return _get(_getPrototypeOf(Pop3Command.prototype), "connect", this).call(this).then(function () {
        return _get(_getPrototypeOf(Pop3Command.prototype), "command", _this2).call(_this2, 'USER', _this2.user);
      }).then(function () {
        return _get(_getPrototypeOf(Pop3Command.prototype), "command", _this2).call(_this2, 'PASS', _this2.password);
      }).then(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            info = _ref3[0];

        return _this2._PASSInfo = info;
      });
    }
  }, {
    key: "UIDL",
    value: function UIDL() {
      var _this3 = this;

      var msgNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return this._connect().then(function () {
        return _get(_getPrototypeOf(Pop3Command.prototype), "command", _this3).call(_this3, 'UIDL', msgNumber);
      }).then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            stream = _ref5[1];

        return (0, _helper.stream2String)(stream);
      }).then(_helper.listify);
    }
  }, {
    key: "RETR",
    value: function RETR(msgNumber) {
      var _this4 = this;

      return this._connect().then(function () {
        return _get(_getPrototypeOf(Pop3Command.prototype), "command", _this4).call(_this4, 'RETR', msgNumber);
      }).then(function (_ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            stream = _ref7[1];

        return stream;
      });
    }
  }, {
    key: "TOP",
    value: function TOP(msgNumber) {
      var _this5 = this;

      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this._connect().then(function () {
        return _get(_getPrototypeOf(Pop3Command.prototype), "command", _this5).call(_this5, 'TOP', msgNumber, n);
      }).then(function (_ref8) {
        var _ref9 = _slicedToArray(_ref8, 2),
            stream = _ref9[1];

        return (0, _helper.stream2String)(stream);
      });
    }
  }, {
    key: "QUIT",
    value: function QUIT() {
      var _this6 = this;

      if (!this._socket) {
        return Promise.resolve(this._PASSInfo = '' || 'Bye');
      }

      return _get(_getPrototypeOf(Pop3Command.prototype), "command", this).call(this, 'QUIT').then(function (_ref10) {
        var _ref11 = _slicedToArray(_ref10, 1),
            info = _ref11[0];

        return _this6._PASSInfo = '' || info;
      });
    }
  }]);

  return Pop3Command;
}(_Connection["default"]);

var _default = Pop3Command;
exports["default"] = _default;