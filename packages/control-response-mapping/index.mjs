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

export function decodeControlFrame(hexOrBytes, profile = {}) {
  const bytes = typeof hexOrBytes === 'string' ? hexToBytes(hexOrBytes) : hexOrBytes;
  if (!bytes || bytes.length < 6) throw new Error('control frame is too short');

  const controlCategory = Number(profile.categories?.control ?? 31);
  const category = bytes[0];
  const fragmentState = bytes[1];
  const payloadLength = readU16le(bytes, 2);
  const payload = bytes.slice(4);

  if (category !== controlCategory) {
    return {
      matched: false,
      reason: `category ${category} does not match control category ${controlCategory}`,
      rawHex: bytesToHex(bytes)
    };
  }

  if ((fragmentState === 0 || fragmentState === 1) && payload.length !== payloadLength) {
    return {
      matched: false,
      reason: `payload length mismatch: header=${payloadLength}, actual=${payload.length}`,
      rawHex: bytesToHex(bytes)
    };
  }

  const command = readU16le(payload, 0);
  const data = payload.slice(2);
  return {
    matched: true,
    category,
    fragmentState,
    payloadLength,
    command,
    data,
    dataHex: bytesToHex(data),
    rawHex: bytesToHex(bytes)
  };
}

export function parseControlResponse(hexOrBytes, profile = {}) {
  const decoded = decodeControlFrame(hexOrBytes, profile);
  if (!decoded.matched) return decoded;

  const map = profile.controlResponses || {};
  const response = Object.entries(map).find(([, spec]) => Number(spec.command) === decoded.command);
  if (!response) {
    return {
      ...decoded,
      type: 'unknown-control-response',
      commandName: `CONTROL_RESPONSE_${decoded.command}`,
      value: decoded.dataHex,
      message: 'No profile controlResponses mapping matched this command.'
    };
  }

  const [commandName, spec] = response;
  const value = decodeValue(decoded.data, spec);
  return {
    ...decoded,
    type: spec.type || 'info',
    commandName,
    requestCommandName: spec.request || null,
    encoding: spec.encoding || 'hex',
    value,
    message: spec.message || `${commandName} parsed.`
  };
}

export function decodeValue(bytes, spec = {}) {
  const encoding = spec.encoding || 'hex';

  if (encoding === 'ascii' || encoding === 'utf8') {
    return new TextDecoder(encoding === 'ascii' ? 'utf-8' : 'utf-8').decode(bytes);
  }

  if (encoding === 'u16le') {
    return readU16le(bytes, 0);
  }

  if (encoding === 'u32le') {
    return readU32le(bytes, 0);
  }

  if (encoding === 'storage-info') {
    return {
      blockSize: readU32le(bytes, 0),
      totalBlocks: readU32le(bytes, 4),
      freeBlocks: readU32le(bytes, 8)
    };
  }

  if (encoding === 'settings-flags') {
    const names = spec.flags || [
      'broadcast',
      'buzzer',
      'vibration',
      'interestLight',
      'interestSensing',
      'ambient',
      'reserved6',
      'reserved7'
    ];
    const out = {};
    names.forEach((name, index) => {
      out[name] = Boolean(bytes[index]);
    });
    return out;
  }

  if (encoding === 'hex') {
    return bytesToHex(bytes);
  }

  return {
    rawHex: bytesToHex(bytes),
    note: `unknown encoding ${encoding}`
  };
}
