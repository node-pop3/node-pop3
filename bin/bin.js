/*! Auto-generated file; please modify /bin/index.js instead */
"use strict";

var _Command = _interopRequireDefault(require("../lib/Command"));

var _helper = require("../lib/helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var args = process.argv,
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
args.slice(2).forEach(function (arg) {
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

var promise;

if (['UIDL', 'TOP', 'QUIT', 'RETR'].includes(methodName)) {
  promise = pop3Command[methodName].apply(pop3Command, _toConsumableArray(options.method.slice(1))).then(function (result) {
    if (methodName === 'RETR') {
      return (0, _helper.stream2String)(result);
    }

    return result;
  });
} else {
  promise = pop3Command.connect().then(function () {
    return pop3Command[methodName].apply(pop3Command, _toConsumableArray(options.method.slice(1)));
  }).then(function (result) {
    return result[1] ? (0, _helper.stream2String)(result[1] || new Buffer()).then(function (str) {
      return [result[0], str];
    }) : result;
  });
}

promise.then(function (result) {
  console.dir(result);
  process.exit(0);
})["catch"](function (err) {
  throw err;
});
