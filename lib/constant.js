'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var CRLF = '\r\n';
exports.CRLF = CRLF;
var CRLF_BUFFER = new Buffer('\r\n');
exports.CRLF_BUFFER = CRLF_BUFFER;
var TERMINATOR_BUFFER = new Buffer('\r\n.\r\n');
exports.TERMINATOR_BUFFER = TERMINATOR_BUFFER;
var TERMINATOR_BUFFER_ARRAY = [new Buffer('\r\n.\r\n'), new Buffer('.\r\n')];

exports.TERMINATOR_BUFFER_ARRAY = TERMINATOR_BUFFER_ARRAY;
var MULTI_LINE_COMMAND_NAME = ['LIST', 'RETR', 'TOP', 'UIDL'];
exports.MULTI_LINE_COMMAND_NAME = MULTI_LINE_COMMAND_NAME;