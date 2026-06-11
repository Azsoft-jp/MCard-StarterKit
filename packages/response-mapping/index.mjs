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

export function decodeOuterFrame(hexOrBytes) {
  const bytes = typeof hexOrBytes === 'string' ? hexToBytes(hexOrBytes) : hexOrBytes;
  if (!bytes || bytes.length < 6) throw new Error('frame is too short');

  const category = bytes[0];
  const fragmentState = bytes[1];
  const payloadLength = readU16le(bytes, 2);
  const payload = bytes.slice(4);

  if ((fragmentState === 0 || fragmentState === 1) && payload.length !== payloadLength) {
    return {
      matched: false,
      reason: `payload length mismatch: header=${payloadLength}, actual=${payload.length}`,
      rawHex: bytesToHex(bytes)
    };
  }

  return {
    matched: true,
    category,
    fragmentState,
    payloadLength,
    payload,
    rawHex: bytesToHex(bytes)
  };
}

export function parseLengthPrefixedResponse(hexOrBytes, profile = {}, group = 'file') {
  const outer = decodeOuterFrame(hexOrBytes);
  if (!outer.matched) return outer;

  const expectedCategory = Number(profile.categories?.[group] ?? (group === 'file' ? 4 : group === 'ota' ? 1 : 31));
  if (outer.category !== expectedCategory) {
    return {
      matched: false,
      reason: `category ${outer.category} does not match ${group} category ${expectedCategory}`,
      rawHex: outer.rawHex
    };
  }

  if (outer.payload.length < 4) {
    return { matched: false, reason: 'inner payload too short', rawHex: outer.rawHex };
  }

  const command = readU16le(outer.payload, 0);
  const dataLength = readU16le(outer.payload, 2);
  const data = outer.payload.slice(4);
  if (data.length !== dataLength) {
    return {
      matched: false,
      reason: `data length mismatch: header=${dataLength}, actual=${data.length}`,
      rawHex: outer.rawHex
    };
  }

  const mapName = group === 'file' ? 'fileResponses' : group === 'ota' ? 'otaResponses' : 'controlResponses';
  const mapping = profile[mapName] || {};
  const found = Object.entries(mapping).find(([, spec]) => Number(spec.command) === command);
  if (!found) {
    return {
      matched: true,
      group,
      type: 'unknown-response',
      command,
      dataLength,
      dataHex: bytesToHex(data),
      rawHex: outer.rawHex,
      message: `No ${mapName} mapping matched command ${command}.`
    };
  }

  const [commandName, spec] = found;
  return {
    matched: true,
    group,
    type: spec.type || inferTypeFromStatus(data),
    command,
    commandName,
    requestCommandName: spec.request || null,
    status: data.length >= 2 ? readU16le(data, 0) : null,
    value: decodeValue(data, spec),
    dataLength,
    dataHex: bytesToHex(data),
    rawHex: outer.rawHex,
    message: spec.message || `${commandName} parsed.`
  };
}

function inferTypeFromStatus(data) {
  if (data.length < 2) return 'info';
  return readU16le(data, 0) === 0 ? 'ack' : 'nack';
}

export function decodeValue(bytes, spec = {}) {
  const encoding = spec.encoding || 'status-u16le';

  if (encoding === 'status-u16le') {
    return { status: bytes.length >= 2 ? readU16le(bytes, 0) : null };
  }

  if (encoding === 'status-packet-u32le') {
    return {
      status: bytes.length >= 2 ? readU16le(bytes, 0) : null,
      packetIndex: bytes.length >= 6 ? readU32le(bytes, 2) : null
    };
  }

  if (encoding === 'lost-packet-list') {
    const status = bytes.length >= 2 ? readU16le(bytes, 0) : null;
    const lost = [];
    for (let offset = 2; offset + 4 <= bytes.length; offset += 4) {
      lost.push(readU32le(bytes, offset));
    }
    return { status, lostPackets: lost };
  }

  if (encoding === 'ascii') return new TextDecoder().decode(bytes);
  if (encoding === 'hex') return bytesToHex(bytes);

  return { rawHex: bytesToHex(bytes), note: `unknown encoding ${encoding}` };
}

export function parseFileResponse(hexOrBytes, profile = {}) {
  return parseLengthPrefixedResponse(hexOrBytes, profile, 'file');
}

export function parseOtaResponse(hexOrBytes, profile = {}) {
  return parseLengthPrefixedResponse(hexOrBytes, profile, 'ota');
}
