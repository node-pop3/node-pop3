#!/usr/bin/env node

/*! Auto-generated file; please modify /bin/index.js instead */
"use strict";

var _path = require("path");

var _Command = _interopRequireDefault(require("../lib/Command"));

var _helper = require("../lib/helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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

function _invokeIgnored(body) {
  var result = body();

  if (result && result.then) {
    return result.then(_empty);
  }
}

function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}

function _invoke(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _process = process,
    argv = _process.argv,
    options = {},
    alias = {
  c: 'config',
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
    mailStructureOptionNames = ['user', 'password', 'host', 'port', 'tls', 'timeout'];

function printHelpAndExit() {
  var text = 'Usage: pop [options]\r\n' + '\r\n' + 'Example: pop -u example@gmail.com -p pwd -h example.pop3.com -m UIDL\r\n' + '\r\n' + 'Options:\r\n' + '  -c, --config      config file (in place of options below)\r\n' + '  -u, --user        username\r\n' + '  -p, --password    password\r\n' + '  -h, --host        host of server\r\n' + '  --port            port of server. Defaults to 110 or 995 if tls is used.\r\n' + '  --tls             whether to use TLS(SSL). Defaults to false.\r\n' + '  --no-tls          disables previously set TLS(SSL).\r\n' + '  -m, --method      method and arguments of API in node-pop3. e.g. \'UIDL\', \'RETR 100\' or \'command USER example@gmail.com\'\r\n' + '  --help            print help';
  console.log(text);
  process.exit(0);
}

var optionName;

if (argv.slice(2).some(function (arg, i, args) {
  if (arg.charAt(0) === '-') {
    optionName = arg.replace(/^-+/g, '');

    if ((optionName || '').length === 1) {
      if (!{}.hasOwnProperty.call(alias, optionName)) {
        console.error('Invalid alias', optionName);
        return true;
      }

      optionName = alias[optionName];
    }

    if (optionName && (i === args.length - 1 || args[i + 1].charAt(0) === '-')) {
      options[optionName] = [true];
    }
  } else if (!optionName) {
    console.error('Invalid argument', arg);
    return true;
  } else if (options[optionName]) {
    options[optionName].push(arg);
  } else {
    options[optionName] = [arg];
  }
})) {
  process.exit();
}

if (options.help) {
  printHelpAndExit();
}

if (options.config) {
  var configOptions = require((0, _path.resolve)(process.cwd(), options.config[0]));

  ['method'].concat(mailStructureOptionNames).forEach(function (optionName) {
    if (!(optionName in options) && optionName in configOptions) {
      options[optionName] = [configOptions[optionName]];
    }
  });
}

for (var _i = 0, _requiredOptionNames = requiredOptionNames; _i < _requiredOptionNames.length; _i++) {
  var requiredOptionName = _requiredOptionNames[_i];

  if (!options[requiredOptionName]) {
    console.error(requiredOptionName + ' is required!');
    printHelpAndExit();
  }
}

if (options.timeout) {
  options.timeout[0] = parseFloat(options.timeout[0]);
}

if ('no-tls' in options) {
  options.tls = [false];
} else if (options.tls && options.tls[0]) {
  // By using `mailStructure`, can still be overridden below
  mailStructure.port = '995';
}

for (var _i2 = 0, _mailStructureOptionN = mailStructureOptionNames; _i2 < _mailStructureOptionN.length; _i2++) {
  var _optionName = _mailStructureOptionN[_i2];
  mailStructure[_optionName] = (options[_optionName] || [])[0] || mailStructure[_optionName];
}

var pop3Command = new _Command["default"](mailStructure);

var _options$method = _slicedToArray(options.method, 1),
    methodName = _options$method[0]; // Todo: Might want to report this to Istnabul as nyc doesn't seem to pick
//   this up, despite it running
// istanbul ignore next


_async(function () {
  var result;
  return _continue(_catch(function () {
    return _invoke(function () {
      if (['UIDL', 'TOP', 'QUIT', 'RETR'].includes(methodName)) {
        return _await(pop3Command[methodName].apply(pop3Command, _toConsumableArray(options.method.slice(1))), function (_pop3Command$methodNa) {
          result = _pop3Command$methodNa;
        });
      } else {
        return _await(pop3Command._connect(), function () {
          return _await(pop3Command.command.apply(pop3Command, _toConsumableArray(options.method)), function (_pop3Command$command) {
            result = _pop3Command$command;
            return _invokeIgnored(function () {
              if (result[1]) {
                var _result = result,
                    _result2 = _slicedToArray(_result, 2),
                    info = _result2[0],
                    stream = _result2[1];

                return _await((0, _helper.stream2String)(stream), function (str) {
                  result = [info, str];
                });
              }
            });
          });
        });
      }
    }, function () {
      return _invokeIgnored(function () {
        if (methodName !== 'QUIT') {
          return _awaitIgnored(pop3Command.QUIT());
        }
      });
    });
  }, function (err) {
    console.error(err);
    process.exit();
  }), function () {
    console.dir(result);
    process.exit(0);
  });
})();

//# sourceMappingURL=pop.js.map