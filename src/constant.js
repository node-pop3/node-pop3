export const CRLF = '\r\n';
export const CRLF_BUFFER = Buffer.from('\r\n');
export const TERMINATOR_BUFFER = Buffer.from('\r\n.\r\n');
export const TERMINATOR_BUFFER_ARRAY = [
  Buffer.from('\r\n.\r\n'),
  Buffer.from('.\r\n'),
];

export const MULTI_LINE_COMMAND_NAME = [
  'LIST',
  'RETR',
  'TOP',
  'UIDL',
];
