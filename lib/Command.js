'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _constant = require('./constant');

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
    this._STATInfo = '';
  }

  _createClass(Pop3Command, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      if (_get(Object.getPrototypeOf(Pop3Command.prototype), '_socket', this)) {
        return Promise.resolve(this._STATInfo);
      }
      var self = this;
      return _get(Object.getPrototypeOf(Pop3Command.prototype), '_connect', this).call(this).then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this).call(_this, 'USER', self.user);
      }).then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this).call(_this, 'PASS', self.password);
      }).then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this).call(_this, 'STAT');
      }).then(function (_ref2) {
        var _ref22 = _slicedToArray(_ref2, 1);

        var info = _ref22[0];
        return self._STATInfo = info;
      });
    }
  }, {
    key: 'UIDL',
    value: function UIDL() {
      var _this2 = this;

      var msgNumber = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return this.connect().then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this2).call(_this2, 'UIDL', msgNumber);
      }).then(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var stream = _ref32[1];
        return new Promise(function (resolve) {
          var buffer = Buffer.concat([]);
          var length = buffer.length;
          stream.on('data', function (_buffer) {
            length += _buffer.length;
            buffer = Buffer.concat([buffer, _buffer], length);
          });
          stream.on('end', function () {
            return resolve(Pop3Command.listify(buffer.toString()));
          });
        });
      });
    }
  }, {
    key: 'RETR',
    value: function RETR(msgNumber) {
      var _this3 = this;

      return this.connect().then(function () {
        return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', _this3).call(_this3, 'RETR', msgNumber);
      }).then(function (_ref4) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var stream = _ref42[1];
        return stream;
      });
    }
  }, {
    key: 'QUIT',
    value: function QUIT() {
      if (!this._socket) {
        console.log('here');
        return Promise.resolve(this._STATInfo = '' || 'Bye');
      }
      var self = this;
      return _get(Object.getPrototypeOf(Pop3Command.prototype), 'command', this).call(this, 'QUIT').then(function (_ref5) {
        var _ref52 = _slicedToArray(_ref5, 1);

        var info = _ref52[0];
        return self._STATInfo = '' || info;
      });
    }
  }], [{
    key: 'listify',
    value: function listify(str) {
      return str.split(_constant.CRLF).filter(function (line) {
        return line;
      }).map(function (line) {
        return line.split(' ');
      });
    }
  }]);

  return Pop3Command;
})(_Connection2['default']);

exports['default'] = Pop3Command;

/*
//const [host, port, tlsBool] = ['outlook.office365.com', '995', true];
//const [host, port, tlsBool] = ['mail.ximalaya.com', '110', false];
const [host, port, tlsBool] = ['pop.exmail.qq.com', '995', true];
//const pop3Lib = new Pop3Command({ host, port, tls: tlsBool, user: 'recruit_hr@ximalaya.com', password: 'recruit123456' });
const pop3Lib = new Pop3Command({ host, port, tls: tlsBool, user: 'test@trymoka.com', password: 'moka@2015' });
pop3Lib.RETR(23)
.then((stream) => stream.on('data', (buffer) => console.log(buffer.toString())));*/
//.then(() => pop3Lib.QUIT());
/*
//.then(() => pop3Lib.command('USER', 'guoxing@trymoka.onmicrosoft.com'))
//.then(() => pop3Lib.command('USER', 'recruit_hr@ximalaya.com'))
//.then(() => pop3Lib.command('USER', 'test@trymoka.com'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('PASS', 'moka@2015'))
//.then(() => pop3Lib.command('PASS', 'moka@2015'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('STAT'))
//.then(([info]) => console.log('info:', info))
//.then(() => pop3Lib.command('DELE', 75))
.then(() => pop3Lib.command('LIST'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})*
.then(() => pop3Lib.command('UIDL'))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Lib.command('RETR', 1))
.then(([info, stream]) => {
  console.log('info:', info);
  stream.on('data', (buffer) => console.log('!!!!!!!!!', buffer.toString()));
})
.then(() => pop3Lib.command('QUIT'))
.then(([info]) => console.log(info))
.catch((err) => console.log(err));*/
module.exports = exports['default'];