/*! Auto-generated file; please modify /bin/index.js instead */
"use strict";

var _Command = _interopRequireDefault(require("../lib/Command"));

var _helper = require("../lib/helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _process = process,
    argv = _process.argv,
    options = {},
    alias = {
  u: 'user',
  p: 'password',
  h: 'host',
  m: 'method'
},
    requiredOptionNames = ['user', 'password', 'host', 'method'],
    mailStructure = {
  port: 110,
  tls: false
},
    mailStructureOptionNames = ['user', 'password', 'host', 'port', 'tls'];

function printHelpAndExit() {
  var text = 'Usage: pop [options]\r\n' + '\r\n' + 'Example: pop -u example@gmail.com -p pwd -h example.pop3.com -m UIDL\r\n' + '\r\n' + 'Options:\r\n' + '  -u, --user        username\r\n' + '  -p, --password    password\r\n' + '  -h, --host        host of server\r\n' + '  --port            port of server. Default to 110\r\n' + '  --tls             whether to use TLS(SSL). Default to false.\r\n' + '  -m, --method      method and arguments of API in node-pop3. e.g. \'UIDL\', \'RETR 100\' or \'command USER example@gmail.com\'\r\n' + '  --help            print help';
  console.log(text);
  process.exit(0);
}

var optionName;
argv.slice(2).forEach(function (arg) {
  if (arg.charAt(0) === '-') {
    optionName = arg.replace(/-/g, '');

    if ((optionName || ' ').length === 1) {
      optionName = alias[optionName];
    }
  } else if (!optionName) {
    return;
  } else if (options[optionName]) {
    options[optionName].push(arg);
  } else {
    options[optionName] = [arg];
  }
});

if (optionName === 'help' || options.help) {
  printHelpAndExit();
}

for (var _i = 0, _requiredOptionNames = requiredOptionNames; _i < _requiredOptionNames.length; _i++) {
  var requiredOptionName = _requiredOptionNames[_i];

  if (!options[requiredOptionName]) {
    console.log(requiredOptionName + ' is required!\r\n');
    printHelpAndExit();
  }
}

for (var _i2 = 0, _mailStructureOptionN = mailStructureOptionNames; _i2 < _mailStructureOptionN.length; _i2++) {
  var _optionName = _mailStructureOptionN[_i2];
  mailStructure[_optionName] = (options[_optionName] || [])[0] || mailStructure[_optionName];
}

var pop3Command = new _Command["default"](mailStructure),
    _options$method = _slicedToArray(options.method, 1),
    methodName = _options$method[0];

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var result, _result, _result2, info, stream, str;

  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!['UIDL', 'TOP', 'QUIT', 'RETR'].includes(methodName)) {
            _context.next = 10;
            break;
          }

          _context.next = 3;
          return pop3Command[methodName].apply(pop3Command, _toConsumableArray(options.method.slice(1)));

        case 3:
          result = _context.sent;

          if (!(methodName === 'RETR')) {
            _context.next = 8;
            break;
          }

          _context.next = 7;
          return (0, _helper.stream2String)(result);

        case 7:
          result = _context.sent;

        case 8:
          _context.next = 21;
          break;

        case 10:
          _context.next = 12;
          return pop3Command.connect();

        case 12:
          _context.next = 14;
          return pop3Command[methodName].apply(pop3Command, _toConsumableArray(options.method.slice(1)));

        case 14:
          result = _context.sent;

          if (!result[1]) {
            _context.next = 21;
            break;
          }

          _result = result, _result2 = _slicedToArray(_result, 2), info = _result2[0], stream = _result2[1];
          _context.next = 19;
          return (0, _helper.stream2String)(stream);

        case 19:
          str = _context.sent;
          result = [info, str];

        case 21:
          console.dir(result);
          process.exit(0);

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();
