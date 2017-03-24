'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _helper = require('./helper');

var Pop3Command = (function (_Pop3Connection) {
  _inherits(Pop3Command, _Pop3Connection);

  function Pop3Command(_ref) {
    var user = _ref.user;
    var password = _ref.password;
    var host = _ref.host;
    var port = _ref.port;
    var tls = _ref.tls;

    _classCallCheck(this, Pop3Command);

    _get(Object.getPrototypeOf(Pop3Command.prototype), 'constructor', this).call(this, { host: host, port: port, tls: tls });
    this.user = user;
    this.password = password;
    this._PASSInfo = '';
  }

  _createClass(Pop3Command, [{
    key: '_connect',
    value: function _connect() {
      var _this = this;

      if (this._socket) {
        return Promise.resolve(this._PASSInfo);
      }
      return _get(Object.getPrototypeOf(Pop3Command.prototype), 'connect', this).call(this).then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this).call(_this, 'USER', _this.user);
      }).then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this).call(_this, 'PASS', _this.password);
      }).then(function (_ref2) {
        var _ref22 = _slicedToArray(_ref2, 1);

        var info = _ref22[0];
        return _this._PASSInfo = info;
      });
    }
  }, {
    key: 'UIDL',
    value: function UIDL() {
      var _this2 = this;

      var msgNumber = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return this._connect().then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this2).call(_this2, 'UIDL', msgNumber);
      }).then(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var stream = _ref32[1];
        return (0, _helper.stream2String)(stream);
      }).then(_helper.listify);
    }
  }, {
    key: 'RETR',
    value: function RETR(msgNumber) {
      var _this3 = this;

      return this._connect().then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this3).call(_this3, 'RETR', msgNumber);
      }).then(function (_ref4) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var stream = _ref42[1];
        return stream;
      });
    }
  }, {
    key: 'TOP',
    value: function TOP(msgNumber) {
      var _this4 = this;

      var n = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      return this._connect().then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this4).call(_this4, 'TOP', msgNumber, n);
      }).then(function (_ref5) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var stream = _ref52[1];
        return (0, _helper.stream2String)(stream);
      });
    }
  }, {
    key: 'QUIT',
    value: function QUIT() {
      var _this5 = this;

      if (!this._socket) {
        return Promise.resolve(this._PASSInfo = '' || 'Bye');
      }
      return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', this).call(this, 'QUIT').then(function (_ref6) {
        var _ref62 = _slicedToArray(_ref6, 1);

        var info = _ref62[0];
        return _this5._PASSInfo = '' || info;
      });
    }
  }]);

  return Pop3Command;
})(_Connection2['default']);

exports['default'] = Pop3Command;
module.exports = exports['default'];