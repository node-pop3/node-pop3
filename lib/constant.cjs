"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TERMINATOR_BUFFER_ARRAY = exports.TERMINATOR_BUFFER = exports.MULTI_LINE_COMMAND_NAME = exports.MAYBE_MULTI_LINE_COMMAND_NAME = exports.CRLF_BUFFER = exports.CRLF = void 0;
const CRLF = '\r\n';
exports.CRLF = CRLF;
const CRLF_BUFFER = Buffer.from('\r\n');
exports.CRLF_BUFFER = CRLF_BUFFER;
const TERMINATOR_BUFFER = Buffer.from('\r\n.\r\n');
exports.TERMINATOR_BUFFER = TERMINATOR_BUFFER;
const TERMINATOR_BUFFER_ARRAY = [Buffer.from('\r\n.\r\n'), Buffer.from('.\r\n'), Buffer.from('.')];
exports.TERMINATOR_BUFFER_ARRAY = TERMINATOR_BUFFER_ARRAY;
const MULTI_LINE_COMMAND_NAME = ['RETR', 'TOP'];
exports.MULTI_LINE_COMMAND_NAME = MULTI_LINE_COMMAND_NAME;
const MAYBE_MULTI_LINE_COMMAND_NAME = ['LIST', 'UIDL'];
exports.MAYBE_MULTI_LINE_COMMAND_NAME = MAYBE_MULTI_LINE_COMMAND_NAME;
//# sourceMappingURL=constant.cjs.map