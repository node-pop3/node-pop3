# node-pop3
pop3 command for node. Support **promise** and **stream**

# Examples
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

* basic

method|params|return
---|---|---
connect||{Promise} resolve to undefined
command|{String} message send for Server|{Promise} resolve to [{String} response message, {Stream} response from multi line command] from Server

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
connect||{Promise} resolve to {String} response message from Server by `PASS` command|If it is connected, pop3 return Promise.resolve(info). If not, pop3 will connect to Server with `_connect` method and `USER`, `PASS` command
UIDL|{String\|Number} msgNum|{Promise} resolve to {Array} responsed list|param is optional
RETR|{String\|Number} msgNum|{Promise} resolve to {Stream} mail stream|
TOP|{String\|Number} msgNum, {Number} n|{Promise} resolve to {String} responsed string|n is default to 0
QUIT||{Promise} resolve to {String} response message|

# ERROR
pop3 will throw new Error with error message from Server.
Beyound that, Error may own two property attached by pop3.

property|comment
---|---
`err.eventName`|event name comes from `socket.on`. Include `error`, `close` and `end`
`err.command`|which command causes the error. For example, `PASS example`

# TEST

e.g. Test the API about `TOP`

`node test -u example@gmail.com -p pwd -h example.pop.com -m TOP 100 10`

For more detail, please input

`node test --help`
