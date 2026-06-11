import assert from 'node:assert/strict';
import { createRetryScheduler, runParsedAckScenario } from '../packages/retry-scheduler/index.mjs';

const frames = [
  { index: 1, frameHex: 'aa' },
  { index: 2, frameHex: 'bb' }
];

const scheduler = createRetryScheduler({ retryLimit: 1, timeoutMs: 100 });
scheduler.loadFrames(frames);
const first = scheduler.nextFrame();
assert.equal(first.index, 1);
scheduler.onParsedNotify({ type: 'ack', packetIndex: 1, status: 0 });
let snap = scheduler.snapshot();
assert.equal(snap.frames.find((x) => x.packet === 1).status, 'ack');

const second = scheduler.nextFrame();
assert.equal(second.index, 2);
scheduler.tick(100);
snap = scheduler.snapshot();
assert.equal(snap.frames.find((x) => x.packet === 2).status, 'retry-queued');

const scenario = runParsedAckScenario({
  frames: [{ index: 1, frameHex: 'aa' }],
  notifications: [{ type: 'ack', packetIndex: 1, status: 0 }],
  options: { retryLimit: 2, timeoutMs: 100 }
});
assert.equal(scenario.frames[0].status, 'ack');

console.log('retry scheduler tests passed');
