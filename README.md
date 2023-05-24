# node-pop3

[pop3](https://tools.ietf.org/html/rfc1939) command support for node.
Supports **Promise** and **stream**.

## CLI

e.g. Test the API about `TOP`

`pop -u example@gmail.com -p pwd -h example.pop.com -m TOP 100 10`

or pass in some or all of the config in a designated config file (JSON or JS):

`pop -c pop.config.js -m TOP 100 10`

For more detail, please input

`pop --help`

## Usage

In CommonJS, you can get the `Pop3Command` as follows:

```js
const Pop3Command = require('node-pop3');
```

The examples below, however, use the [ESM Modules](https://nodejs.org/api/esm.html)
format instead (i.e., `import`).

## Example

- Fetch mail by msgNum:

```js
import Pop3Command from 'node-pop3';

const pop3 = new Pop3Command({
  user: 'example@example.com',
  password: 'example',
  host: 'pop3.example.com'
});

const msgNum = 1;

const str = await pop3.RETR(msgNum);
// deal with mail string
await pop3.QUIT();
```

- List msgNum to uid in Server

```js
const list = await pop3.UIDL();
console.dir(list);
/*
 * [
 *  ['1', 'ZC0113-H8wi_YChVab4F0QTbwP4B6i'],
 *  ['2', 'ZC0114-3A9gAn8M2Sp1RhVCGTIII6i'],
 *  ...
 * ]
*/
```

## API

* constructor(options)

params|optional|comment
---|---|---
options.user|no|String
options.password|no|String
options.host|no|String
options.port|yes|Number. Defaults to `110`
options.servername|yes|String. Defaults to `host` value. Same as `servername` for Node TLS option.
options.tls|yes|Boolean. Defaults to `false`
options.timeout|yes|Number. Defaults to `undefined`
options.tlsOptions|yes|Defaults to `{}`

`tlsOptions` takes the options documented for your Node version and
`tls.connect` function.

* basic

method|params|return
---|---|---
connect||`{Promise}` resolve to `undefined`
command|`{String*}` command messages to Server|`{Promise}` resolve to `{Array[String, Stream]}`, which are messages of response and stream of response (if the response has multiple lines) from Server
listify|Splits lines by CRLF, filters out empty lines, and converts each line to a an array based on splitting by spaces

```js
const pop3 = new Pop3Command({host: 'pop3.example.com'});

// These must be in order
await pop3.connect();
await pop3.command('USER', 'example@example.com');
await pop3.command('PASS', 'example');

const [statInfo] = await pop3.command('STAT');
const [retrInfo, retrStream] = await pop3.command('RETR', 1);

console.log(statInfo); // 100 102400
console.log(retrInfo); // 1024 octets

const [quitInfo] = await pop3.command('QUIT');
console.log(quitInfo); // Logging out.

const streamString = await Pop3Command.stream2String(retrStream);
console.log(streamString); // <message details...>

console.log(
  await Pop3Command.listify(streamString)
); // [ ['Return-Path:', 'brett@...'], ...]
```

* common

method|params|return|comment
---|---|---|---
UIDL|`{String\|Number}` msgNum|`{Promise}` resolve to `{Array}` list of responsed|msgNum is optional
RETR|`{String\|Number}` msgNum|`{Promise}` resolve to `{String}` of mail stream|
TOP|`{String\|Number}` msgNum, `{Number}` n|`{Promise}` resolve to `{String}` message of responsed|n is default to 0
QUIT||`{Promise}` resolve to `{String}` message of response message|

## ERROR

pop3 will throw new Error's with an error message from Server.
Beyond that, Error may have two properties attached by pop3.

property|comment
---|---
`err.eventName`|event name comes from `socket.on`. Includes `error`, `close`, `timeout`, `end`, and `bad-server-response`. `command` may also throw `no-socket`.
`err.command`|which command causes the error. For example, `PASS example`

## To-dos

1. Testing:
    1. Set up CI with hidden `pop.config.json` credentials
    1. Avoid skipping some tests
1. Edge cases
    1. After timeout, ensure any stream is ended (so other commands can
        continue)
    1. Ensure `command` will reject if socket is ended.
    1. Ensure in fixing the above that can QUIT and reuse same instance
