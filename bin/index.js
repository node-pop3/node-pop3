'use strict';
var Pop3Command = require('../lib/Command');

var stream2String = require('../lib/helper').stream2String;

var args = process.argv,
  options = {},
  optionName,
  alias = {
    u: 'user',
    p: 'password',
    h: 'host',
    m: 'method',
  },
  requiredOptionNames = ['user', 'password', 'host', 'method'],
  mailStructure = {
    port: 110,
    tls: false,
  },
  mailStructureOptionNames = ['user', 'password', 'host', 'port', 'tls'];

function printHelpAndExit() {
  var text = 'Usage: pop [options]\r\n'
           + '\r\n'
           + 'Example: pop -u example@gmail.com -p pwd -h example.pop3.com -m UIDL\r\n'
           + '\r\n'
           + 'Options:\r\n'
           + '  -u, --user        username\r\n'
           + '  -p, --password    password\r\n'
           + '  -h, --host        host of server\r\n'
           + '  --port            port of server. Default to 110\r\n'
           + '  --tls             whether to use TLS(SSL). Default to false.\r\n'
           + '  -m, --method      method and arguments of API in node-pop3. e.g. \'UIDL\', \'RETR 100\' or \'command USER example@gmail.com\'\r\n'
           + '  --help            print help';
  console.log(text);
  process.exit(0);
}

args.slice(2).forEach(function(arg) {
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

if (optionName === 'help' || options['help']) {
  printHelpAndExit();
}

for (var i = 0; i < requiredOptionNames.length; i++) {
  if (!options[requiredOptionNames[i]]) {
    console.log(requiredOptionNames[i] + ' is required!\r\n');
    printHelpAndExit();
  }
}

var _optionName;
for (var j = 0; j < mailStructureOptionNames.length; j++) {
  _optionName = mailStructureOptionNames[j];
  mailStructure[_optionName] = (options[_optionName] || [])[0] || mailStructure[_optionName];
}

var pop3Command = new Pop3Command(mailStructure),
  methodName = options['method'][0],
  promise;

if (['UIDL', 'TOP', 'QUIT', 'RETR'].indexOf(methodName) > -1) {
  promise = pop3Command[methodName].apply(pop3Command, options['method'].slice(1))
    .then(function(result) {
      if (methodName === 'RETR') {
        return stream2String(result);
      }
      return result;
    });
} else {
  promise = pop3Command.connect()
    .then(function() {
      return pop3Command[methodName].apply(pop3Command, options['method'].slice(1));
    })
    .then(function(result) {
      return result[1]
        ? stream2String(result[1] || new Buffer())
          .then(function(str) {
            return [result[0], str];
          })
        : result;
    });
}

promise.then(function(result) {
  console.dir(result);
  process.exit(0);
})
  .catch(function(err){
    throw err;
  });
