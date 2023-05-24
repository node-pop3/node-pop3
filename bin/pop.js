#!/usr/bin/env node
import {readFile} from 'fs/promises';
import {join} from 'path';

import Pop3Command from '../src/Command.js';
import {stream2String} from '../src/helper.js';

const {argv} = process,
  /**
   * @type {{
   *   help: [boolean],
   *   [key: string]: any[]
   * }}
   */
  options = {},
  alias = {
    c: 'config',
    u: 'user',
    p: 'password',
    h: 'host',
    m: 'method',
  },
  requiredOptionNames = ['user', 'password', 'host', 'method'],
  /**
   * @typedef {number} Integer
   */

  /**
   * @type {{
   *   user: string,
   *   password: string,
   *   host: string,
   *   port?: Integer,
   *   tls?: boolean,
   *   timeout?: Integer,
   *   tlsOptions?: import('tls').TlsOptions,
   *   servername?: string
   * }}
   */
  mailStructure = {},
  mailStructureOptionNames = ['user', 'password', 'host', 'port', 'tls', 'timeout'];

mailStructure.port = 110;
mailStructure.tls = false;

function printHelpAndExit() {
  const text = 'Usage: pop [options]\r\n'
           + '\r\n'
           + 'Example: pop -u example@gmail.com -p pwd -h example.pop3.com -m UIDL\r\n'
           + '\r\n'
           + 'Options:\r\n'
           + '  -c, --config      config file (in place of options below)\r\n'
           + '  -u, --user        username\r\n'
           + '  -p, --password    password\r\n'
           + '  -h, --host        host of server\r\n'
           + '  --port            port of server. Defaults to 110 or 995 if tls is used.\r\n'
           + '  --tls             whether to use TLS(SSL). Defaults to false.\r\n'
           + '  --no-tls          disables previously set TLS(SSL).\r\n'
           + '  -m, --method      method and arguments of API in node-pop3. e.g. \'UIDL\', \'RETR 100\' or \'command USER example@gmail.com\'\r\n'
           + '  --help            print help';
  console.log(text);
  process.exit(0);
}

/** @type {string} */
let optionName;
if (argv.slice(2).some(function(arg, i, args) {
  if (arg.charAt(0) === '-') {
    optionName = arg.replace(/^-+/g, '');
    if ((optionName || '').length === 1) {
      if (!Object.hasOwn(alias, optionName)) {
        console.error('Invalid alias', optionName);
        return true;
      }
      optionName = alias[/** @type {"c"|"u"|"p"|"h"|"m"} */ (optionName)];
    }
    if (
      optionName &&
      (i === args.length - 1 || args[i + 1].charAt(0) === '-')
    ) {
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
  const configOptions = JSON.parse(
    // @ts-expect-error It's ok
    await readFile(
      new URL(join('../', options.config[0]), import.meta.url)
    )
  );

  ['method', ...mailStructureOptionNames].forEach((optionName) => {
    if (!(optionName in options) && optionName in configOptions) {
      options[optionName] = [configOptions[optionName]];
    }
  });
}

for (const requiredOptionName of requiredOptionNames) {
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
  mailStructure.port = 995;
}
for (const _optionName of mailStructureOptionNames) {
  // @ts-expect-error Unclear what is wrong here?
  mailStructure[
    /** @type {"user"|"password"|"host"|"port"|"tls"|"timeout"} */ (
      _optionName
    )
  ] = (
    options[_optionName] || []
  )[0] || mailStructure[
    /** @type {"user"|"password"|"host"|"port"|"tls"|"timeout"} */
    (_optionName)
  ];
}

const pop3Command = new Pop3Command(
    /**
   * @type {{
    *   user: string,
    *   password: string,
    *   host: string,
    *   port?: Integer,
    *   tls?: boolean,
    *   timeout?: Integer,
    *   tlsOptions?: import('tls').TlsOptions,
    *   servername?: string
    * }}
    */
  (mailStructure)
);
const [methodName] = options.method;

let result;
try {
  if (['UIDL', 'TOP', 'QUIT', 'RETR'].includes(methodName)) {
    result = await pop3Command[
      /** @type {"UIDL"|"TOP"|"QUIT"|"RETR"} */
      (methodName)
    ](
      // @ts-expect-error It's ok
      ...options.method.slice(1)
    );
  } else {
    await pop3Command._connect();
    result = await pop3Command.command(...options.method);
    if (result[1]) {
      const [info, stream] = result;
      const str = await stream2String(stream);
      result = [info, str];
    }
  }
  if (methodName !== 'QUIT') {
    await pop3Command.QUIT();
  }
} catch (err) {
  console.error(err);
  process.exit();
}

console.dir(result);
process.exit(0);
