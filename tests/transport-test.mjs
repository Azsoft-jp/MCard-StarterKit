import assert from 'node:assert/strict';
import { createMemoryTransport, createTransportSession } from '../packages/transport/index.mjs';
import { createAckMatcher } from '../packages/ack-matcher/index.mjs';

const transport = createMemoryTransport({
  writeHandler(frame) {
    return {
      parsed: {
        type: 'ack',
        status: 0,
        packetIndex: frame.index
      }
    };
  }
});

const session = createTransportSession({
  transport,
  frames: [{ index: 1, frameHex: 'aa' }, { index: 2, frameHex: 'bb' }],
  ackMatcher: createAckMatcher(),
  retryLimit: 1
});

await session.start();
const snap = session.snapshot();
assert.equal(snap.results.length, 2);
assert.equal(snap.results[0].status, 'ack');
assert.equal(snap.results[1].status, 'ack');
assert.equal(snap.cursor, 2);

console.log('transport tests passed');
