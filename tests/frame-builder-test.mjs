import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildProfileFileTransferFrames, normalizeProfile, bytesToHex } from '../packages/frame-builder/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));
const normalized = normalizeProfile(profile);
assert.equal(normalized.categories.file, 4);
assert.equal(normalized.fileCommands.FILE_SEND_DATA_REQUEST, 8);

const payload = new TextEncoder().encode('hello');
const plan = buildProfileFileTransferFrames(profile, payload, { mtu: 247 });
assert.equal(plan.profileId, 'monicard-like.sample');
assert.equal(plan.totalPackets, 1);
assert.equal(plan.dataPacketCommand, 8);
assert.match(plan.frames[0].frameHex, /^0400/);
assert.equal(plan.frames[0].index, 1);

console.log('frame builder tests passed');
