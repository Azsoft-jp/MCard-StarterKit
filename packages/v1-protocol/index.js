'use strict';

const CATEGORY = Object.freeze({
  OTA: 0x01,
  FILE: 0x04,
  CONTROL: 0x1f
});

const FRAGMENT = Object.freeze({
  COMPLETE: 0,
  FIRST: 1,
  MIDDLE: 2,
  LAST: 3
});

const CONTROL_COMMAND = Object.freeze({
  PING: 0,
  PONG: 1,
  GET_SERIAL: 18,
  SERIAL_RESPONSE: 19,
  GET_VERSION: 20,
  VERSION_RESPONSE: 21,
  GET_BATTERY: 22,
  BATTERY_RESPONSE: 23,
  GET_FS_INFO: 32,
  FS_INFO_RESPONSE: 33
});

const FILE_COMMAND = Object.freeze({
  START_REQUEST: 0,
  START_RESPONSE: 1,
  SEND_START_REQUEST: 2,
  SEND_START_RESPONSE: 3,
  SEND_END_REQUEST: 6,
  SEND_END_RESPONSE: 7,
  DATA_REQUEST: 8,
  DATA_RESPONSE: 9,
  LOSE_CHECK_REQUEST: 10,
  LOSE_CHECK_RESPONSE: 11,
  INFO_REQUEST: 13,
  INFO_RESPONSE: 14
});

const OTA_COMMAND = Object.freeze({
  START_REQUEST: 38,
  START_RESPONSE: 39,
  DATA_REQUEST: 40,
  DATA_RESPONSE: 41,
  END_REQUEST: 42,
  END_RESPONSE: 43
});

const SAMPLE = Object.freeze({
  VERSION: '0.1.0',
  SERIAL: 'MCARD-V1-SAMPLE-0001',
  BATTERY_PERCENT: 87,
  FS_BLOCK_SIZE: 4096,
  FS_TOTAL_BLOCKS: 2048,
  FS_FREE_BLOCKS: 1024
});

function toBuffer(value = []) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array || Array.isArray(value)) {
    return Buffer.from(value);
  }
  if (typeof value === 'string') return Buffer.from(value, 'utf8');
  throw new TypeError('expected bytes, an array, or a string');
}

function u16le(value) {
  const out = Buffer.alloc(2);
  out.writeUInt16LE(value, 0);
  return out;
}

function u32le(value) {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(value >>> 0, 0);
  return out;
}

function buildOuterFrame(category, fragmentState, payload) {
  const body = toBuffer(payload);
  if (body.length > 0xffff) throw new RangeError('payload exceeds uint16 length');
  if (fragmentState < FRAGMENT.COMPLETE || fragmentState > FRAGMENT.LAST) {
    throw new RangeError('invalid fragment state');
  }

  const header = Buffer.alloc(4);
  header[0] = category;
  header[1] = fragmentState;
  header.writeUInt16LE(body.length, 2);
  return Buffer.concat([header, body]);
}

function buildControlFrame(command, data = [], fragmentState = FRAGMENT.COMPLETE) {
  return buildOuterFrame(
    CATEGORY.CONTROL,
    fragmentState,
    Buffer.concat([u16le(command), toBuffer(data)])
  );
}

function buildLengthPrefixedFrame(
  category,
  command,
  data = [],
  fragmentState = FRAGMENT.COMPLETE
) {
  if (category !== CATEGORY.FILE && category !== CATEGORY.OTA) {
    throw new RangeError('length-prefixed frames require FILE or OTA category');
  }
  const bytes = toBuffer(data);
  if (bytes.length > 0xffff) throw new RangeError('data exceeds uint16 length');
  return buildOuterFrame(
    category,
    fragmentState,
    Buffer.concat([u16le(command), u16le(bytes.length), bytes])
  );
}

function parseFrame(input) {
  const bytes = toBuffer(input);
  if (bytes.length < 6) throw new Error('frame is too short');

  const category = bytes[0];
  const fragmentState = bytes[1];
  const payloadLength = bytes.readUInt16LE(2);
  if (fragmentState > FRAGMENT.LAST) throw new Error('invalid fragment state');
  if (payloadLength !== bytes.length - 4) throw new Error('payload length mismatch');

  const command = bytes.readUInt16LE(4);
  let dataOffset = 6;
  let dataLength = payloadLength - 2;

  if (category === CATEGORY.FILE || category === CATEGORY.OTA) {
    if (payloadLength < 4) throw new Error('length-prefixed payload is too short');
    dataLength = bytes.readUInt16LE(6);
    dataOffset = 8;
    if (payloadLength !== 4 + dataLength) {
      throw new Error('data length mismatch');
    }
  } else if (category !== CATEGORY.CONTROL) {
    throw new Error(`unsupported category 0x${category.toString(16).padStart(2, '0')}`);
  }

  return {
    category,
    fragmentState,
    payloadLength,
    command,
    data: bytes.subarray(dataOffset, dataOffset + dataLength)
  };
}

function buildControlResponse(command) {
  switch (command) {
    case CONTROL_COMMAND.PING:
      return buildControlFrame(CONTROL_COMMAND.PONG, 'PONG');
    case CONTROL_COMMAND.GET_SERIAL:
      return buildControlFrame(CONTROL_COMMAND.SERIAL_RESPONSE, SAMPLE.SERIAL);
    case CONTROL_COMMAND.GET_VERSION:
      return buildControlFrame(CONTROL_COMMAND.VERSION_RESPONSE, SAMPLE.VERSION);
    case CONTROL_COMMAND.GET_BATTERY:
      return buildControlFrame(
        CONTROL_COMMAND.BATTERY_RESPONSE,
        u16le(SAMPLE.BATTERY_PERCENT)
      );
    case CONTROL_COMMAND.GET_FS_INFO:
      return buildControlFrame(
        CONTROL_COMMAND.FS_INFO_RESPONSE,
        Buffer.concat([
          u32le(SAMPLE.FS_BLOCK_SIZE),
          u32le(SAMPLE.FS_TOTAL_BLOCKS),
          u32le(SAMPLE.FS_FREE_BLOCKS)
        ])
      );
    default:
      return null;
  }
}

function mapAckCommand(category, command) {
  const maps = category === CATEGORY.FILE
    ? [
        [FILE_COMMAND.START_REQUEST, FILE_COMMAND.START_RESPONSE],
        [FILE_COMMAND.SEND_START_REQUEST, FILE_COMMAND.SEND_START_RESPONSE],
        [FILE_COMMAND.SEND_END_REQUEST, FILE_COMMAND.SEND_END_RESPONSE],
        [FILE_COMMAND.DATA_REQUEST, FILE_COMMAND.DATA_RESPONSE],
        [FILE_COMMAND.LOSE_CHECK_REQUEST, FILE_COMMAND.LOSE_CHECK_RESPONSE],
        [FILE_COMMAND.INFO_REQUEST, FILE_COMMAND.INFO_RESPONSE]
      ]
    : [
        [OTA_COMMAND.START_REQUEST, OTA_COMMAND.START_RESPONSE],
        [OTA_COMMAND.DATA_REQUEST, OTA_COMMAND.DATA_RESPONSE],
        [OTA_COMMAND.END_REQUEST, OTA_COMMAND.END_RESPONSE]
      ];
  return maps.find(([request]) => request === command)?.[1] ?? null;
}

function responseIncludesPacketIndex(category, responseCommand) {
  return (
    category === CATEGORY.FILE &&
    responseCommand === FILE_COMMAND.DATA_RESPONSE
  ) || (
    category === CATEGORY.OTA &&
    responseCommand === OTA_COMMAND.DATA_RESPONSE
  );
}

function buildDeterministicResponse(input) {
  const frame = input && typeof input === 'object' && 'command' in input
    ? input
    : parseFrame(input);

  if (frame.category === CATEGORY.CONTROL) {
    return buildControlResponse(frame.command);
  }

  const responseCommand = mapAckCommand(frame.category, frame.command);
  if (responseCommand == null) return null;
  const responseData = [u16le(0)];
  if (responseIncludesPacketIndex(frame.category, responseCommand)) {
    const packetIndex = frame.data.length >= 4 ? frame.data.readUInt32LE(0) : 1;
    responseData.push(u32le(packetIndex));
  }
  return buildLengthPrefixedFrame(
    frame.category,
    responseCommand,
    Buffer.concat(responseData)
  );
}

module.exports = {
  CATEGORY,
  FRAGMENT,
  CONTROL_COMMAND,
  FILE_COMMAND,
  OTA_COMMAND,
  SAMPLE,
  buildOuterFrame,
  buildControlFrame,
  buildLengthPrefixedFrame,
  parseFrame,
  buildDeterministicResponse
};
