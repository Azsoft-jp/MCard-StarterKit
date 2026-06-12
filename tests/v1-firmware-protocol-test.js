'use strict';

const assert = require('assert');
const {
  CATEGORY,
  CONTROL_COMMAND,
  FILE_COMMAND,
  OTA_COMMAND,
  SAMPLE,
  buildControlFrame,
  buildLengthPrefixedFrame,
  parseFrame,
  buildDeterministicResponse
} = require('../packages/v1-protocol');

function hex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

const ping = buildControlFrame(CONTROL_COMMAND.PING);
assert.strictEqual(hex(ping), '1f0002000000');
assert.strictEqual(
  hex(buildDeterministicResponse(ping)),
  '1f0006000100504f4e47'
);

const versionRequest = buildControlFrame(CONTROL_COMMAND.GET_VERSION);
assert.strictEqual(hex(versionRequest), '1f0002001400');
const versionResponse = parseFrame(buildDeterministicResponse(versionRequest));
assert.strictEqual(versionResponse.command, CONTROL_COMMAND.VERSION_RESPONSE);
assert.strictEqual(versionResponse.data.toString('utf8'), SAMPLE.VERSION);

const batteryResponse = parseFrame(buildDeterministicResponse(
  buildControlFrame(CONTROL_COMMAND.GET_BATTERY)
));
assert.strictEqual(batteryResponse.data.readUInt16LE(0), SAMPLE.BATTERY_PERCENT);

const fsResponse = parseFrame(buildDeterministicResponse(
  buildControlFrame(CONTROL_COMMAND.GET_FS_INFO)
));
assert.strictEqual(fsResponse.data.readUInt32LE(0), SAMPLE.FS_BLOCK_SIZE);
assert.strictEqual(fsResponse.data.readUInt32LE(4), SAMPLE.FS_TOTAL_BLOCKS);
assert.strictEqual(fsResponse.data.readUInt32LE(8), SAMPLE.FS_FREE_BLOCKS);

const serialResponse = parseFrame(buildDeterministicResponse(
  buildControlFrame(CONTROL_COMMAND.GET_SERIAL)
));
assert.strictEqual(serialResponse.data.toString('utf8'), SAMPLE.SERIAL);

const otaRequest = buildLengthPrefixedFrame(
  CATEGORY.OTA,
  OTA_COMMAND.DATA_REQUEST,
  Buffer.from([7, 0, 0, 0])
);
const otaResponse = parseFrame(buildDeterministicResponse(otaRequest));
assert.strictEqual(otaResponse.command, OTA_COMMAND.DATA_RESPONSE);
assert.strictEqual(otaResponse.data.readUInt16LE(0), 0);
assert.strictEqual(otaResponse.data.readUInt32LE(2), 7);

const statusOnlyCases = [
  [CATEGORY.FILE, FILE_COMMAND.START_REQUEST, FILE_COMMAND.START_RESPONSE],
  [CATEGORY.FILE, FILE_COMMAND.SEND_START_REQUEST, FILE_COMMAND.SEND_START_RESPONSE],
  [CATEGORY.FILE, FILE_COMMAND.SEND_END_REQUEST, FILE_COMMAND.SEND_END_RESPONSE],
  [CATEGORY.FILE, FILE_COMMAND.LOSE_CHECK_REQUEST, FILE_COMMAND.LOSE_CHECK_RESPONSE],
  [CATEGORY.FILE, FILE_COMMAND.INFO_REQUEST, FILE_COMMAND.INFO_RESPONSE],
  [CATEGORY.OTA, OTA_COMMAND.START_REQUEST, OTA_COMMAND.START_RESPONSE],
  [CATEGORY.OTA, OTA_COMMAND.END_REQUEST, OTA_COMMAND.END_RESPONSE]
];

for (const [category, requestCommand, responseCommand] of statusOnlyCases) {
  const response = parseFrame(buildDeterministicResponse(
    buildLengthPrefixedFrame(category, requestCommand)
  ));
  assert.strictEqual(response.command, responseCommand);
  assert.strictEqual(response.data.length, 2);
  assert.strictEqual(response.data.readUInt16LE(0), 0);
}

const fileDataResponse = parseFrame(buildDeterministicResponse(
  buildLengthPrefixedFrame(
    CATEGORY.FILE,
    FILE_COMMAND.DATA_REQUEST,
    Buffer.from([9, 0, 0, 0])
  )
));
assert.strictEqual(fileDataResponse.command, FILE_COMMAND.DATA_RESPONSE);
assert.strictEqual(fileDataResponse.data.length, 6);
assert.strictEqual(fileDataResponse.data.readUInt16LE(0), 0);
assert.strictEqual(fileDataResponse.data.readUInt32LE(2), 9);

assert.strictEqual(
  buildDeterministicResponse(buildControlFrame(0xffff)),
  null,
  'unknown commands must not generate a response'
);
assert.throws(
  () => parseFrame(Buffer.from('1f0003001400', 'hex')),
  /payload length mismatch/
);
assert.throws(
  () => parseFrame(Buffer.from('0100040028000300', 'hex')),
  /data length mismatch/
);

console.log('V1 firmware protocol tests passed');
