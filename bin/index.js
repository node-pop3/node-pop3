import Pop3Command from '../lib/Command';

import {stream2String} from '../lib/helper';

const args = process.argv,
  options = {},
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
  const text = 'Usage: pop [options]\r\n'
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

let optionName;
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

if (optionName === 'help' || options.help) {
  printHelpAndExit();
}

for (const requiredOptionName of requiredOptionNames) {
  if (!options[requiredOptionName]) {
    console.log(requiredOptionName + ' is required!\r\n');
    printHelpAndExit();
  }
}

for (const _optionName of mailStructureOptionNames) {
  mailStructure[_optionName] = (options[_optionName] || [])[0] || mailStructure[_optionName];
}

const pop3Command = new Pop3Command(mailStructure),
  [methodName] = options.method;

(async () => {

let result;
if (['UIDL', 'TOP', 'QUIT', 'RETR'].includes(methodName)) {
  result = await pop3Command[methodName](...options.method.slice(1));
  if (methodName === 'RETR') {
    result = await stream2String(result);
  }
} else {
  await pop3Command.connect();
  result = await pop3Command[methodName](...options.method.slice(1));
  if (result[1]) {
    const str = await stream2String(result[1]);
    result = [result[0], str];
  }
}

console.dir(result);
process.exit(0);

})();
