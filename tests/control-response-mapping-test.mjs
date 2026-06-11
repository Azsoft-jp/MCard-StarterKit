import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseControlResponse } from '../packages/control-response-mapping/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));

const version = parseControlResponse('1f 00 07 00 15 00 30 2e 31 2e 30', profile);
assert.equal(version.matched, true);
assert.equal(version.commandName, 'VERSION_RESPONSE');
assert.equal(version.value, '0.1.0');

const battery = parseControlResponse('1f 00 04 00 17 00 57 00', profile);
assert.equal(battery.commandName, 'BATTERY_RESPONSE');
assert.equal(battery.value, 87);

console.log('control response mapping tests passed');
