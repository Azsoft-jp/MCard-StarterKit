import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildProfileCommandFrame } from '../packages/frame-builder/index.mjs';
import { parseControlResponse } from '../packages/control-response-mapping/index.mjs';
import { parseFileResponse, parseOtaResponse } from '../packages/response-mapping/index.mjs';

const profile = JSON.parse(fs.readFileSync('examples/profiles/monicard-like.sample.json', 'utf8'));
const vectors = JSON.parse(fs.readFileSync('examples/test-vectors/protocol-vectors.json', 'utf8')).vectors;

for (const vector of vectors) {
  if (vector.kind === 'control-frame') {
    const frame = buildProfileCommandFrame(profile, {
      group: vector.input.group,
      commandName: vector.input.commandName,
      inputMode: 'hex',
      hex: vector.input.hex
    });
    assert.equal(frame.command, vector.expect.command);
    assert.ok(frame.frameHex.startsWith(vector.expect.prefixHex));
  }

  if (vector.kind === 'control-response') {
    const parsed = parseControlResponse(vector.hex, profile);
    assert.equal(parsed.commandName, vector.expect.commandName);
    assert.equal(parsed.value, vector.expect.value);
  }

  if (vector.kind === 'file-response') {
    const parsed = parseFileResponse(vector.hex, profile);
    assert.equal(parsed.commandName, vector.expect.commandName);
    assert.equal(parsed.value.packetIndex, vector.expect.packetIndex);
  }

  if (vector.kind === 'ota-response') {
    const parsed = parseOtaResponse(vector.hex, profile);
    assert.equal(parsed.commandName, vector.expect.commandName);
    assert.equal(parsed.value.packetIndex, vector.expect.packetIndex);
  }
}

console.log('protocol vectors tests passed');
