export const CRLF = '\r\n';
export const CRLF_BUFFER = new Buffer('\r\n');
export const TERMINATOR_BUFFER = new Buffer('\r\n.\r\n');
export const TERMINATOR_BUFFER_ARRAY = [
  new Buffer('\r\n.\r\n'),
  new Buffer('.\r\n'),
];

export const MULTI_LINE_COMMAND_NAME = [
  'LIST',
  'RETR',
  'TOP',
  'UIDL',
];
