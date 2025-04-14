"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TERMINATOR_BUFFER_ARRAY = exports.TERMINATOR_BUFFER = exports.MULTI_LINE_COMMAND_NAME = exports.MAYBE_MULTI_LINE_COMMAND_NAME = exports.CRLF_BUFFER = exports.CRLF = void 0;
const CRLF = exports.CRLF = '\r\n';
const CRLF_BUFFER = exports.CRLF_BUFFER = Buffer.from('\r\n');
const TERMINATOR_BUFFER = exports.TERMINATOR_BUFFER = Buffer.from('\r\n.\r\n');
const TERMINATOR_BUFFER_ARRAY = exports.TERMINATOR_BUFFER_ARRAY = [Buffer.from('\r\n.\r\n'), Buffer.from('.\r\n'), Buffer.from('.')];
const MULTI_LINE_COMMAND_NAME = exports.MULTI_LINE_COMMAND_NAME = ['RETR', 'TOP'];
const MAYBE_MULTI_LINE_COMMAND_NAME = exports.MAYBE_MULTI_LINE_COMMAND_NAME = ['LIST', 'UIDL'];
//# sourceMappingURL=constant.cjs.map