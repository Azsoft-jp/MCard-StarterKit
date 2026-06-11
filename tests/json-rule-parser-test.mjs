import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseWithJsonRules } from '../packages/json-rule-parser/index.mjs';

const rules = JSON.parse(fs.readFileSync('examples/plugins/monicard-like-file-ack.rules.json', 'utf8'));
const parsed = parseWithJsonRules('04 00 0a 00 09 00 06 00 00 00 01 00 00 00', rules);

assert.equal(parsed.matched, true);
assert.equal(parsed.commandName, 'FILE_SEND_DATA_RESPONSE');
assert.equal(parsed.status, 0);
assert.equal(parsed.packetIndex, 1);

console.log('json rule parser tests passed');
