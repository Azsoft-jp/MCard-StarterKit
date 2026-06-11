import assert from 'node:assert/strict';
import { matchAck } from '../packages/ack-matcher/index.mjs';

const ok = matchAck({ type: 'ack', value: { status: 0, packetIndex: 3 } }, { packetIndex: 3 });
assert.equal(ok.matched, true);
assert.equal(ok.packetIndex, 3);

const bad = matchAck({ type: 'ack', value: { status: 0, packetIndex: 4 } }, { packetIndex: 3 });
assert.equal(bad.matched, false);

console.log('ack matcher tests passed');
