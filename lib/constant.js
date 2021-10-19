"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TERMINATOR_BUFFER_ARRAY = exports.TERMINATOR_BUFFER = exports.MULTI_LINE_COMMAND_NAME = exports.CRLF_BUFFER = exports.CRLF = void 0;
var CRLF = '\r\n';
exports.CRLF = CRLF;
var CRLF_BUFFER = Buffer.from('\r\n');
exports.CRLF_BUFFER = CRLF_BUFFER;
var TERMINATOR_BUFFER = Buffer.from('\r\n.\r\n');
exports.TERMINATOR_BUFFER = TERMINATOR_BUFFER;
var TERMINATOR_BUFFER_ARRAY = [Buffer.from('\r\n.\r\n'), Buffer.from('.\r\n')];
exports.TERMINATOR_BUFFER_ARRAY = TERMINATOR_BUFFER_ARRAY;
var MULTI_LINE_COMMAND_NAME = ['LIST', 'RETR', 'TOP', 'UIDL'];
exports.MULTI_LINE_COMMAND_NAME = MULTI_LINE_COMMAND_NAME;
//# sourceMappingURL=constant.js.map