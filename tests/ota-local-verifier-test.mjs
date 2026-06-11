import assert from 'node:assert/strict';
import {
  buildSyntheticMcot,
  verifyMcot,
  bytesToHex,
  hexToBytes
} from '../packages/ota-local-verifier/index.mjs';

const bytes = buildSyntheticMcot({ text: 'synthetic ota test', imageId: 7 });
const result = verifyMcot(bytes);
assert.equal(result.ok, true);
assert.equal(result.magic, 'MCOT');
assert.equal(result.imageCount, 1);
assert.equal(result.images[0].imageId, 7);

const hex = bytesToHex(bytes, ' ');
const result2 = verifyMcot(hexToBytes(hex));
assert.equal(result2.ok, true);

console.log('ota local verifier tests passed');
