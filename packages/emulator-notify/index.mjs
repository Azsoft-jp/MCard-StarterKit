export function hexToBytes(hex) {
  const compact = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
  if (compact.length % 2 !== 0) throw new Error('hex input must contain an even number of digits');
  return Uint8Array.from(compact.match(/.{2}/g)?.map((pair) => parseInt(pair, 16)) || []);
}

export function bytesToHex(bytes, sep = ' ') {
  return Array.from(bytes || [], (byte) => byte.toString(16).padStart(2, '0')).join(sep);
}

export function readU16le(bytes, offset) {
  if (offset + 2 > bytes.length) return null;
  return bytes[offset] | (bytes[offset + 1] << 8);
}

export function readU32le(bytes, offset) {
  if (offset + 4 > bytes.length) return null;
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

export function u16le(value) {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff);
}

export function u32le(value) {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

export function concatBytes(...parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function makeOuterFrame(category, fragmentState, payload) {
  return concatBytes(Uint8Array.of(category & 0xff, fragmentState & 0xff), u16le(payload.length), payload);
}

export function makeLengthPrefixedResponse(category, command, data, fragmentState = 0) {
  return makeOuterFrame(category, fragmentState, concatBytes(u16le(command), u16le(data.length), data));
}

export function makeControlResponse(category, command, data, fragmentState = 0) {
  return makeOuterFrame(category, fragmentState, concatBytes(u16le(command), data));
}

export function decodeRequestFrame(hexOrBytes) {
  const bytes = typeof hexOrBytes === 'string' ? hexToBytes(hexOrBytes) : hexOrBytes;
  if (!bytes || bytes.length < 4) throw new Error('frame is too short');

  const category = bytes[0];
  const fragmentState = bytes[1];
  const payloadLength = readU16le(bytes, 2);
  const payload = bytes.slice(4);

  if ((fragmentState === 0 || fragmentState === 1) && payload.length !== payloadLength) {
    return { matched: false, reason: 'payload length mismatch', rawHex: bytesToHex(bytes) };
  }

  const command = readU16le(payload, 0);
  const lengthOrNull = payload.length >= 4 ? readU16le(payload, 2) : null;
  const possibleData = lengthOrNull != null && payload.length >= 4 && payload.slice(4).length === lengthOrNull
    ? payload.slice(4)
    : payload.slice(2);

  return {
    matched: true,
    category,
    fragmentState,
    payloadLength,
    command,
    dataLength: possibleData.length,
    data: possibleData,
    rawHex: bytesToHex(bytes)
  };
}

export function simulateNotifyForFrame(hexOrBytes, profile = {}, options = {}) {
  const request = decodeRequestFrame(hexOrBytes);
  if (!request.matched) {
    return {
      ok: false,
      request,
      notifications: [{
        type: 'error',
        message: request.reason || 'request did not decode'
      }]
    };
  }

  const categories = {
    file: Number(profile.categories?.file ?? 4),
    ota: Number(profile.categories?.ota ?? 1),
    control: Number(profile.categories?.control ?? 31),
  };

  if (request.category === categories.control) {
    return simulateControlNotify(request, profile, options);
  }

  if (request.category === categories.file) {
    return simulateFileNotify(request, profile, options);
  }

  if (request.category === categories.ota) {
    return simulateOtaNotify(request, profile, options);
  }

  return {
    ok: true,
    request,
    notifications: [{
      type: 'unknown-category',
      message: `No emulator behavior for category ${request.category}`,
      rawRequestHex: request.rawHex
    }]
  };
}

function simulateControlNotify(request, profile, options) {
  const commands = profile.controlCommands || {};
  const category = Number(profile.categories?.control ?? 31);

  const commandMap = [
    [commands.GET_SERIAL_NUMBER ?? 18, commands.SERIAL_NUMBER_RESPONSE ?? 19, textBytes(options.serialNumber || 'MCARD-SAMPLE-0001')],
    [commands.GET_VERSION ?? 20, commands.VERSION_RESPONSE ?? 21, textBytes(options.version || '0.1.0')],
    [commands.GET_BATTERY ?? 22, commands.BATTERY_RESPONSE ?? 23, u16le(Number(options.battery ?? 87))],
    [commands.GET_STORAGE_INFO ?? 32, commands.STORAGE_INFO_RESPONSE ?? 33, concatBytes(u32le(4096), u32le(2048), u32le(1024))],
    [commands.GET_CONTROL_INFO ?? 40, commands.CONTROL_INFO_RESPONSE ?? 41, Uint8Array.of(1, 1, 1, 0, 0, 1, 0, 0)],
    [commands.GET_CAROUSEL ?? 60, commands.CAROUSEL_RESPONSE ?? 61, u16le(5)],
  ];

  const found = commandMap.find(([requestCommand]) => Number(requestCommand) === Number(request.command));
  if (!found) {
    const fallbackCommand = Number(request.command) + 1;
    const notify = makeControlResponse(category, fallbackCommand, u16le(0));
    return makeNotifyResult(request, 'control-generic-ack', notify);
  }

  const [, responseCommand, data] = found;
  const notify = makeControlResponse(category, responseCommand, data);
  return makeNotifyResult(request, 'control-response', notify);
}

function simulateFileNotify(request, profile, options) {
  const commands = profile.fileCommands || {};
  const category = Number(profile.categories?.file ?? 4);
  const responseByRequest = new Map([
    [commands.START_REQUEST ?? 0, commands.START_RESPONSE ?? 1],
    [commands.FILE_SEND_START_REQUEST ?? 2, commands.FILE_SEND_START_RESPONSE ?? 3],
    [commands.FILE_SEND_DATA_REQUEST ?? 8, commands.FILE_SEND_DATA_RESPONSE ?? 9],
    [commands.FILE_SEND_END_REQUEST ?? 6, commands.FILE_SEND_END_RESPONSE ?? 7],
    [commands.LOSE_CHECK_REQUEST ?? 10, commands.LOSE_CHECK_RESPONSE ?? 11],
    [commands.FILE_INFO_REQUEST ?? 13, commands.FILE_INFO_RESPONSE ?? 14],
  ]);

  const responseCommand = responseByRequest.get(request.command) ?? (request.command + 1);
  const status = Number(options.status ?? 0);
  const packetIndex = request.dataLength >= 4 ? readU32le(request.data, 0) : Number(options.packetIndex ?? 1);
  const data = responseCommand === (commands.LOSE_CHECK_RESPONSE ?? 11)
    ? u16le(status)
    : concatBytes(u16le(status), u32le(packetIndex || 1));

  const notify = makeLengthPrefixedResponse(category, responseCommand, data);
  return makeNotifyResult(request, 'file-response', notify, { packetIndex });
}

function simulateOtaNotify(request, profile, options) {
  const commands = profile.otaCommands || {};
  const category = Number(profile.categories?.ota ?? 1);
  const responseByRequest = new Map([
    [commands.OTA_START_REQUEST ?? 38, commands.OTA_START_RESPONSE ?? 39],
    [commands.OTA_DATA_REQUEST ?? 40, commands.OTA_DATA_RESPONSE ?? 41],
    [commands.OTA_END_REQUEST ?? 42, commands.OTA_END_RESPONSE ?? 43],
  ]);

  const responseCommand = responseByRequest.get(request.command) ?? (request.command + 1);
  const status = Number(options.status ?? 0);
  const packetIndex = request.dataLength >= 4 ? readU32le(request.data, 0) : Number(options.packetIndex ?? 1);
  const data = concatBytes(u16le(status), u32le(packetIndex || 1));
  const notify = makeLengthPrefixedResponse(category, responseCommand, data);
  return makeNotifyResult(request, 'ota-response', notify, { packetIndex });
}

function makeNotifyResult(request, type, notifyBytes, extra = {}) {
  return {
    ok: true,
    request: {
      category: request.category,
      command: request.command,
      fragmentState: request.fragmentState,
      dataLength: request.dataLength,
      rawHex: request.rawHex
    },
    notifications: [{
      type,
      bytes: notifyBytes.length,
      hex: bytesToHex(notifyBytes),
      compactHex: bytesToHex(notifyBytes, ''),
      ...extra
    }]
  };
}

function textBytes(text) {
  return new TextEncoder().encode(String(text));
}

export function simulateNotifySequence(frames = [], profile = {}, options = {}) {
  const events = [];
  for (const frame of frames) {
    const hex = frame.frameHex || frame.hex || frame;
    const result = simulateNotifyForFrame(hex, profile, options);
    events.push({
      frameIndex: frame.index ?? null,
      result
    });
  }
  return {
    ok: events.every((event) => event.result.ok),
    count: events.length,
    events
  };
}
