"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Connection = _interopRequireDefault(require("./Connection.js"));

var _helper = require("./helper.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _empty() {}

function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Pop3Command = /*#__PURE__*/function (_Pop3Connection) {
  _inherits(Pop3Command, _Pop3Connection);

  var _super = _createSuper(Pop3Command);

  function Pop3Command(_ref) {
    var _this;

    var user = _ref.user,
        password = _ref.password,
        host = _ref.host,
        port = _ref.port,
        tls = _ref.tls,
        timeout = _ref.timeout,
        tlsOptions = _ref.tlsOptions,
        servername = _ref.servername;

    _classCallCheck(this, Pop3Command);

    _this = _super.call(this, {
      host: host,
      port: port,
      tls: tls,
      timeout: timeout,
      tlsOptions: tlsOptions,
      servername: servername
    });
    _this.user = user;
    _this.password = password;
    _this._PASSInfo = '';
    return _this;
  }

  _createClass(Pop3Command, [{
    key: "_connect",
    value: function _connect() {
      try {
        var _this3 = this;

        if (_this3._socket) {
          return _await(_this3._PASSInfo);
        }

        return _await(_get(_getPrototypeOf(Pop3Command.prototype), "connect", _this3).call(_this3), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this3).call(_this3, 'USER', _this3.user), function () {
            return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this3).call(_this3, 'PASS', _this3.password), function (_ref2) {
              var _ref3 = _slicedToArray(_ref2, 1),
                  info = _ref3[0];

              _this3._PASSInfo = info;
              return _this3._PASSInfo;
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "UIDL",
    value: function UIDL() {
      var msgNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      try {
        var _this5 = this;

        return _await(_this5._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this5).call(_this5, 'UIDL', msgNumber), function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                stream = _ref5[1];

            return _await((0, _helper.stream2String)(stream), function (str) {
              var list = (0, _helper.listify)(str);
              return msgNumber ? list[0] : list;
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "NOOP",
    value: function NOOP() {
      try {
        var _this7 = this;

        return _await(_this7._connect(), function () {
          return _awaitIgnored(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this7).call(_this7, 'NOOP'));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "LIST",
    value: function LIST() {
      var msgNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      try {
        var _this9 = this;

        return _await(_this9._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this9).call(_this9, 'LIST', msgNumber), function (_ref6) {
            var _ref7 = _slicedToArray(_ref6, 2),
                stream = _ref7[1];

            return _await((0, _helper.stream2String)(stream), function (str) {
              var list = (0, _helper.listify)(str);
              return msgNumber ? list[0] : list;
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "RSET",
    value: function RSET() {
      try {
        var _this11 = this;

        return _await(_this11._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this11).call(_this11, 'RSET'), function (_ref8) {
            var _ref9 = _slicedToArray(_ref8, 1),
                info = _ref9[0];

            return info;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "RETR",
    value: function RETR(msgNumber) {
      try {
        var _this13 = this;

        return _await(_this13._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this13).call(_this13, 'RETR', msgNumber), function (_ref10) {
            var _ref11 = _slicedToArray(_ref10, 2),
                stream = _ref11[1];

            return (0, _helper.stream2String)(stream);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "DELE",
    value: function DELE(msgNumber) {
      try {
        var _this15 = this;

        return _await(_this15._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this15).call(_this15, 'DELE', msgNumber), function (_ref12) {
            var _ref13 = _slicedToArray(_ref12, 1),
                info = _ref13[0];

            return info;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "STAT",
    value: function STAT() {
      try {
        var _this17 = this;

        return _await(_this17._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this17).call(_this17, 'STAT'), function (_ref14) {
            var _ref15 = _slicedToArray(_ref14, 1),
                info = _ref15[0];

            return info;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "TOP",
    value: function TOP(msgNumber) {
      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      try {
        var _this19 = this;

        return _await(_this19._connect(), function () {
          return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this19).call(_this19, 'TOP', msgNumber, n), function (_ref16) {
            var _ref17 = _slicedToArray(_ref16, 2),
                stream = _ref17[1];

            return (0, _helper.stream2String)(stream);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: "QUIT",
    value: function QUIT() {
      try {
        var _this21 = this;

        if (!_this21._socket) {
          _this21._PASSInfo = '' || 'Bye';
          return _await(_this21._PASSInfo);
        }

        return _await(_get(_getPrototypeOf(Pop3Command.prototype), "command", _this21).call(_this21, 'QUIT'), function (_ref18) {
          var _ref19 = _slicedToArray(_ref18, 1),
              info = _ref19[0];

          _this21._PASSInfo = info || '';
          return _this21._PASSInfo;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);

  return Pop3Command;
}(_Connection["default"]);

Pop3Command.stream2String = _helper.stream2String;
Pop3Command.listify = _helper.listify;
var _default = Pop3Command;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=Command.js.map