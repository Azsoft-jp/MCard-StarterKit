import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseFileResponse, parseOtaResponse } from '../packages/response-mapping/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));

const file = parseFileResponse('04 00 0a 00 09 00 06 00 00 00 01 00 00 00', profile);
assert.equal(file.matched, true);
assert.equal(file.commandName, 'FILE_SEND_DATA_RESPONSE');
assert.equal(file.value.packetIndex, 1);

const ota = parseOtaResponse('01 00 0a 00 29 00 06 00 00 00 01 00 00 00', profile);
assert.equal(ota.matched, true);
assert.equal(ota.commandName, 'OTA_DATA_RESPONSE');
assert.equal(ota.value.packetIndex, 1);

console.log('response mapping tests passed');
