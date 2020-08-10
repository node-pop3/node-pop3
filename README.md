# node-pop3

pop3 command for node. Supports **Promise** and **stream**.

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
  host: 'pop3.example.com',
});

const msgNum = 1;

(async () => {

  await string = pop3.RETR(msgNum);
  // deal with mail string
  await pop3.QUIT();

})();
```

- List msgNum to uid in Server

```js
const list = await pop3.UIDL();
console.dir(list);
/**
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
options.user|`false`
options.password|`false`|
options.host|`false`|
options.port|`true`|Default to `110`
options.tls|`true`|Default to `false`
options.timeout|`true`|Default to `undefined`

* basic

method|params|return
---|---|---
connect||`{Promise}` resolve to `undefined`
command|`{String*}` command messages to Server|`{Promise}` resolve to `{Array[String, Stream]}`, which are messages of response and stream of response (if the response has multiple lines) from Server

```js
const pop3 = new Pop3Command({ host: 'pop3.example.com' });

(async () => {

  await pop3.connect();
  await pop3.command('USER', 'example@example.com');
  await pop3.command('PASS', 'example');

  const [info] = await pop3.command('STAT');
  console.log(info); // 100 102400

  const [info, stream] = await pop3.command('RETR', 1);
  console.log(info); // 1024 octets

  const [info] = await pop3.command('QUIT');
  console.log(info); // Bye

})();

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
    1. Ensure tests seed (and then delete) messages (e.g., using `emailjs`)
    1. Set up CI with hidden `pop.config.json` credentials
    1. Avoid skipping some tests
1. Edge cases
    1. After timeout, ensure any stream is ended (so other commands can
        continue)
    1. Ensure `command` will reject if socket is ended.
    1. Ensure in fixing the above that can QUIT and reuse same instance
