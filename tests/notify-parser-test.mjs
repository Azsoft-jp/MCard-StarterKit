import assert from 'node:assert/strict';
import { parseNotify, parseNotifyWithFallback, listNotifyParsers } from '../packages/notify-parsers/index.mjs';

const fileAck = parseNotify('04 00 06 00 09 00 02 00 00 00', 'monicard-like-file-ack');
assert.equal(fileAck.matched, true);
assert.equal(fileAck.type, 'ack');
assert.equal(fileAck.command, 9);
assert.equal(fileAck.status, 0);

const control = parseNotify('1f 00 07 00 15 00 30 2e 31 2e 30', 'monicard-like-control');
assert.equal(control.matched, true);
assert.equal(control.command, 21);

const json = parseNotify('7b 22 74 79 70 65 22 3a 22 61 63 6b 22 2c 22 70 61 63 6b 65 74 22 3a 31 7d', 'json-line');
assert.equal(json.matched, true);
assert.equal(json.type, 'ack');
assert.equal(json.packetIndex, 1);

const auto = parseNotifyWithFallback('04 00 06 00 09 00 02 00 00 00');
assert.equal(auto.parser, 'monicard-like-file-ack');

assert.ok(listNotifyParsers().length >= 5);

console.log('notify parser tests passed');
