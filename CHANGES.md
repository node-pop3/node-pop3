# CHANGES to node-pop3

## 0.10.0

BREAKING CHANGES:
- Requires Node ^20.11.0 || >= 22.0.0

- fix(security): avoid leaking password in potentially loggable errors (#37)
- chore: update devDeps.

## 0.9.1 (2025-04-15)

- fix: avoid trailing spaces for parameterless commands (#34)
- fix: destroy stream after timeout

## 0.9.0 (2023-05-24)

- feat: ESM modules (BREAKING)
- feat: TypeScript types
- feat: added LAST command (@metafloor)
- fix: LIST and UIDL with msg-nbr (@metafloor)
- fix: add '.' to TERMINATOR_BUFFER_ARRAY constant (@Irykson)
- docs: link to spec
- docs: document `listify`

## 0.8.0 (2022-01-16)

- Enhancement: Add `servername` option

## 0.7.0 (2021-10-22)

- Enhancement: Add `tlsOptions` option
- Fix: Drop TLS socket if erring (so subsequent `connect` can detect)
- Fix: Report if no socket
- Docs: Add sample `pop.config-sample.json` file; Clarify values
- Chore: update devDeps. , add lint script, and switch to pnpm

## 0.6.0 (2020-08-10)

- Breaking change: Change named exports `listify` and `stream2String` to
  attach to the default export class to enable `require` to avoid `default`.
- Docs: Document CommonJS usage

## 0.5.1 (2020-07-19)

- npm: Update devDeps (and build)

## 0.5.0 (2020-07-19)

- Breaking enhancement: Add genuine Node exports

## 0.4.0 (2020-07-19)

- Breaking change: Have public RETR stringify stream
- Breaking change: Cause public UIDL to return single item if a message number
  was specified
- Enhancement: Add public methods for LIST, RSET, DELE, STAT, NOOP

## 0.3.0 (2020-07-19)

- Breaking change: Requires Node >= 6
- Enhancement: Added `timeout` option (also to binary)
- Enhancement: Re-export `listify` and `streamtoString`
- Enhancement: If `tls` is set, default port to 995
- Enhancement: Add source maps
- Enhancement: Throw `no-socket` Error in `command` if no socket left
- Enhancement (binary): Change `test` file to a genuine binary (as `pop`)
- Enhancement (binary): Support passing in `--config` file (used also in tests)
- Fix: Add `bad-server-response` error (handle obscure case where server
    doesn't follow spec or gives unknown response)
- Fix: Reject `command` early upon error
- Fix (CLI): For other commands, use `_connect` instead of `connect` to allow
  necessary authentication before practical use
- Fix (CLI): Allow boolean args at any posiiton
- Fix (CLI): Report bad alias (though ignore empty `--` arg)
- Fix (CLI) Avoid including reference to promise being uncaught in reported
  errors; catch any errors ourselves but log error to stderr
- Fix (CLI): Ensure `QUIT` in CLI usage after every other command
- Update: Avoid deprecated `new Buffer` in favor of `Buffer.from`
- Refactoring: Misc. improvements/linting
- Testing: Add Mocha + NYC testing
