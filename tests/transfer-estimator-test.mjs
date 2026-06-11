import assert from 'node:assert/strict';
import { estimateTransferTime } from '../packages/transfer-estimator/index.mjs';

const estimate = estimateTransferTime({
  totalPackets: 10,
  frames: Array.from({ length: 10 }, () => ({ frameLength: 100 }))
}, {
  id: 'test-profile',
  transfer: { writesPerSecond: 10, ackDelayMs: 20 },
  media: { maxPackageBytes: 500 }
});

assert.equal(estimate.profileId, 'test-profile');
assert.equal(estimate.totalPackets, 10);
assert.ok(estimate.estimatedMs > 0);
assert.ok(estimate.warnings.length >= 1);

console.log('transfer estimator tests passed');
