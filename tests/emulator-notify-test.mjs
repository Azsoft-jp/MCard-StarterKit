import assert from 'node:assert/strict';
import fs from 'node:fs';
import { simulateNotifyForFrame, simulateNotifySequence } from '../packages/emulator-notify/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));

const control = simulateNotifyForFrame('1f 00 02 00 14 00', profile);
assert.equal(control.ok, true);
assert.match(control.notifications[0].hex, /^1f 00/);

const file = simulateNotifyForFrame('04 00 0a 00 08 00 06 00 01 00 00 00 ab cd', profile);
assert.equal(file.ok, true);
assert.match(file.notifications[0].hex, /^04 00/);
assert.equal(file.notifications[0].packetIndex, 1);

const sequence = simulateNotifySequence([
  { index: 1, frameHex: '1f 00 02 00 14 00' },
  { index: 2, frameHex: '04 00 0a 00 08 00 06 00 01 00 00 00 ab cd' }
], profile);
assert.equal(sequence.count, 2);
assert.equal(sequence.ok, true);

console.log('emulator notify tests passed');
