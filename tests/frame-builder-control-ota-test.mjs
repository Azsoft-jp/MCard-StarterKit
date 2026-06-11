import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildProfileCommandFrame,
  buildProfileOtaPlan
} from '../packages/frame-builder/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));

const control = buildProfileCommandFrame(profile, {
  group: 'control',
  commandName: 'GET_VERSION',
  inputMode: 'hex',
  hex: ''
});
assert.equal(control.group, 'control');
assert.equal(control.command, 20);
assert.match(control.frameHex, /^1f00/);

const ota = buildProfileOtaPlan(profile, new TextEncoder().encode('synthetic ota payload'), { packetSize: 8 });
assert.equal(ota.profileId, 'monicard-like.sample');
assert.ok(ota.totalPackets >= 1);
assert.equal(ota.dataPacketCommandName, 'OTA_DATA_REQUEST');
assert.match(ota.frames[0].frameHex, /^010/);

console.log('frame builder control ota tests passed');
