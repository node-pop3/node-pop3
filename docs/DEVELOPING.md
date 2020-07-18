# Developing for node-pop3

## Testing

To run the tests, you will need to create a `pop.config.json` (or
`pop.config.js`) file at project root which contains a POP email account
`user`, `password`, `host`, and with `tls: true`. (This config file is
ignored by `.gitignore` and `.npmignore`, so you don't need to worry about
your credentials being accidentally committed.)

As the current tests do not add emails, you should have at least one
email in your POP account.
