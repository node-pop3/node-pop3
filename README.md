# node-pop3
pop3 command for node. Support **promise** and **stream**

# Installation
`npm install node-pop3`

# Test
e.g. Test the API about `TOP`

`node test -u example@gmail.com -p pwd -h example.pop.com -m TOP 100 10`

For more detail, please input

`node test --help`

# Example
* Fetch mail by msgNum:
```javascript
  import Pop3Command from 'node-pop3';

  const pop3 = new Pop3Command({
    user: 'example@example.com',
    password: 'example',
    host: 'pop3.example.com',
  })

  const msgNum = 1;

  pop3.RETR(msgNum)
  .then((stream) => {
    // deal with mail stream
  })
  .then(() => pop3.QUIT());
```
* List msgNum to uid in Server
```javascript
  pop3.UIDL()
  .then((list) => console.dir(list));
  /**
   * [
   *  ['1', 'ZC0113-H8wi_YChVab4F0QTbwP4B6i'],
   *  ['2', 'ZC0114-3A9gAn8M2Sp1RhVCGTIII6i'],
   *  ...
   * ]
  */
```
# API
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
connect||`{Promise}` resolve to undefined
command|`{String*}` command messages to Server|`{Promise}` resolve to `{Array[String, Stream]}`, which are message of response and stream of response(if the response has multi lines) from Server

```javascript
  const pop3 = new Pop3Command({ host: 'pop3.example.com' });

  pop3.connect()
  .then(() => pop3.command('USER', 'example@example.com'))
  .then(() => pop3.command('PASS', 'example'))
  .then(() => pop3.command('STAT'))
  .then(([info]) => console.log(info)) // 100 102400
  .then(() => pop3.command('RETR', 1))
  .then(([info, stream]) => console.log(info)) // 1024 octets
  .then(() => pop3.command('QUIT'))
  .then(([info]) => console.log(info)); // Bye

```

* common

method|params|return|comment
---|---|---|---
UIDL|`{String\|Number}` msgNum|`{Promise}` resolve to `{Array}` list of responsed|msgNum is optional
RETR|`{String\|Number}` msgNum|`{Promise}` resolve to `{Stream}` mail stream|
TOP|`{String\|Number}` msgNum, `{Number}` n|`{Promise}` resolve to `{String}` message of responsed|n is default to 0
QUIT||`{Promise}` resolve to `{String}` message of response message|

# ERROR
pop3 will throw new Error with error message from Server.
Beyound that, Error may own two property attached by pop3.

property|comment
---|---
`err.eventName`|event name comes from `socket.on`. Include `error`, `close`, `timeout` and `end`
`err.command`|which command causes the error. For example, `PASS example`
