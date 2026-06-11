import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeWindowsBridgeLog, normalizeWebBluetoothLog, mergeTransportLogs } from '../packages/transport-adapters/index.mjs';

const sample = fs.readFileSync('examples/windows-bridge/sample-log.txt', 'utf8');
const win = normalizeWindowsBridgeLog(sample);
assert.equal(win.adapter, 'windows-bridge-log');
assert.ok(win.events.some((event) => event.type === 'write'));
assert.ok(win.events.some((event) => event.type === 'notify'));

const web = normalizeWebBluetoothLog([{ type: 'notify', hex: 'aa', parsed: { type: 'ack' } }]);
assert.equal(web.adapter, 'web-bluetooth');
assert.equal(web.events[0].type, 'notify');

const merged = mergeTransportLogs(win, web);
assert.ok(merged.events.length > win.events.length);

console.log('transport adapters tests passed');
