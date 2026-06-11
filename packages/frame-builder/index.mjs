export function hexToBytes(hex) {
  const compact = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
  if (compact.length % 2 !== 0) throw new Error('hex input must contain an even number of digits');
  const out = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) out[i / 2] = parseInt(compact.slice(i, i + 2), 16);
  return out;
}

export function bytesToHex(bytes, sep = '') {
  return Array.from(bytes || [], (byte) => byte.toString(16).padStart(2, '0')).join(sep);
}

export function u16le(value) {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff);
}

export function u32le(value) {
  return Uint8Array.of(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  );
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

export function crc32Mpeg2(bytes) {
  let crc = 0xffffffff >>> 0;
  for (const byte of bytes) {
    crc ^= (byte << 24) >>> 0;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x80000000) ? ((crc << 1) ^ 0x04c11db7) >>> 0 : (crc << 1) >>> 0;
    }
  }
  return crc >>> 0;
}

export function normalizeProfile(profile = {}) {
  const categories = {
    ota: Number(profile.categories?.ota ?? 1),
    file: Number(profile.categories?.file ?? 4),
    control: Number(profile.categories?.control ?? 31),
  };

  const fileCommands = {
    START_REQUEST: 0,
    START_RESPONSE: 1,
    FILE_SEND_START_REQUEST: 2,
    FILE_SEND_START_RESPONSE: 3,
    FILE_SEND_DATA_REQUEST: 8,
    FILE_SEND_DATA_RESPONSE: 9,
    FILE_SEND_END_REQUEST: 6,
    FILE_SEND_END_RESPONSE: 7,
    END_REQUEST: 8,
    END_RESPONSE: 9,
    LOSE_CHECK_REQUEST: 10,
    LOSE_CHECK_RESPONSE: 11,
    FILE_INFO_REQUEST: 13,
    FILE_INFO_RESPONSE: 14,
    ...(profile.fileCommands || {})
  };

  const frameModes = {
    control: profile.frameModes?.control || 'command-only',
    file: profile.frameModes?.file || 'length-prefixed-command',
    ota: profile.frameModes?.ota || 'length-prefixed-command',
  };

  const transfer = {
    mtu: Number(profile.transfer?.defaultMtu ?? 247),
    minPacketSize: Number(profile.transfer?.minPacketSize ?? 256),
    maxPacketSize: Number(profile.transfer?.maxPacketSize ?? 10240),
    packetFormula: profile.transfer?.packetFormula || '50*(mtu-7)-8',
    dataPacketCommandName: profile.transfer?.dataPacketCommandName || 'FILE_SEND_DATA_REQUEST',
    includePacketIndex: profile.transfer?.includePacketIndex ?? true,
    packetIndexBytes: Number(profile.transfer?.packetIndexBytes ?? 4),
    packetIndexBase: Number(profile.transfer?.packetIndexBase ?? 1),
  };

  return {
    ...profile,
    categories,
    fileCommands,
    frameModes,
    transfer,
  };
}

export function calculatePacketSize(profile, mtuInput) {
  const p = normalizeProfile(profile);
  const mtu = Number(mtuInput ?? p.transfer.mtu);
  let packetSize = 50 * (mtu - 7) - 8;
  packetSize = Math.max(p.transfer.minPacketSize, Math.min(p.transfer.maxPacketSize, packetSize));
  return packetSize;
}

export function makeOuterFrame(category, fragmentState, payload) {
  return concatBytes(
    Uint8Array.of(category & 0xff, fragmentState & 0xff),
    u16le(payload.length),
    payload
  );
}

export function makeCommandPayload(mode, command, data) {
  if (mode === 'command-only') {
    return concatBytes(u16le(command), data);
  }
  if (mode === 'length-prefixed-command') {
    return concatBytes(u16le(command), u16le(data.length), data);
  }
  throw new Error(`unsupported frame mode: ${mode}`);
}

export function makeProfileFrame(profile, group, commandNameOrValue, data = new Uint8Array(), fragmentState = 0) {
  const p = normalizeProfile(profile);
  const category = p.categories[group];
  if (category == null) throw new Error(`unknown category group: ${group}`);

  let command = Number(commandNameOrValue);
  if (Number.isNaN(command)) {
    const mapName = group === 'file' ? 'fileCommands' : group === 'control' ? 'controlCommands' : 'otaCommands';
    command = Number(p[mapName]?.[commandNameOrValue]);
  }
  if (!Number.isFinite(command)) throw new Error(`unknown command: ${commandNameOrValue}`);

  const mode = p.frameModes[group] || 'length-prefixed-command';
  return makeOuterFrame(category, fragmentState, makeCommandPayload(mode, command, data));
}

export function pad4WithCrc(bytes) {
  const padLength = (4 - (bytes.length % 4)) % 4;
  const padded = concatBytes(bytes, new Uint8Array(padLength));
  const crc = crc32Mpeg2(padded);
  return {
    padded,
    transferBytes: concatBytes(padded, u32le(crc)),
    crc32Mpeg2: crc.toString(16).padStart(8, '0'),
    padLength
  };
}

export function buildProfileFileTransferFrames(profile, mediaBytes, options = {}) {
  const p = normalizeProfile(profile);
  const packetSize = calculatePacketSize(p, options.mtu);
  const { transferBytes, padded, crc32Mpeg2, padLength } = pad4WithCrc(mediaBytes);
  const packetCount = Math.ceil(transferBytes.length / packetSize);
  const frames = [];
  const commandName = p.transfer.dataPacketCommandName;
  const command = p.fileCommands[commandName];

  if (!Number.isFinite(Number(command))) {
    throw new Error(`profile dataPacketCommandName not found: ${commandName}`);
  }

  for (let i = 0; i < packetCount; i++) {
    const start = i * packetSize;
    const end = Math.min(transferBytes.length, start + packetSize);
    const chunk = transferBytes.slice(start, end);
    const packetIndex = p.transfer.packetIndexBase + i;
    const data = p.transfer.includePacketIndex
      ? concatBytes(makePacketIndexBytes(packetIndex, p.transfer.packetIndexBytes), chunk)
      : chunk;
    const fragmentState = packetCount === 1 ? 0 : (i === 0 ? 1 : (i === packetCount - 1 ? 3 : 2));
    const frameBytes = makeProfileFrame(p, 'file', commandName, data, fragmentState);

    frames.push({
      index: packetIndex,
      zeroBasedIndex: i,
      fragmentState,
      dataOffset: start,
      dataLength: chunk.length,
      command,
      commandName,
      frameLength: frameBytes.length,
      frameHex: bytesToHex(frameBytes),
      frameHexSpaced: bytesToHex(frameBytes, ' '),
      chunkCrc32Mpeg2: crc32Mpeg2Chunk(chunk)
    });
  }

  return {
    profileId: p.id || 'anonymous-profile',
    packetSize,
    originalSize: mediaBytes.length,
    paddedSize: padded.length,
    padLength,
    totalSize: transferBytes.length,
    totalPackets: frames.length,
    payloadCrc32Mpeg2: crc32Mpeg2,
    dataPacketCommandName: commandName,
    dataPacketCommand: command,
    frames
  };
}

function makePacketIndexBytes(index, bytes) {
  if (bytes === 2) return u16le(index);
  if (bytes === 4) return u32le(index);
  if (bytes === 0) return new Uint8Array();
  throw new Error(`unsupported packetIndexBytes: ${bytes}`);
}

function crc32Mpeg2Chunk(bytes) {
  return crc32Mpeg2(bytes).toString(16).padStart(8, '0');
}


export function bytesFromInput(input = {}) {
  const mode = input.inputMode || 'text';
  if (mode === 'hex') return hexToBytes(input.hex || '');
  if (mode === 'base64') {
    const bin = globalThis.Buffer
      ? globalThis.Buffer.from(input.base64 || '', 'base64')
      : Uint8Array.from(atob(input.base64 || ''), (c) => c.charCodeAt(0));
    return new Uint8Array(bin);
  }
  return new TextEncoder().encode(input.text || '');
}

export function buildProfileCommandFrame(profile, options = {}) {
  const p = normalizeProfile(profile);
  const group = options.group || 'control';
  const commandNameOrValue = options.commandName || options.command || 0;
  const data = options.data instanceof Uint8Array ? options.data : bytesFromInput(options);
  const fragmentState = Number(options.fragmentState ?? 0);
  const frameBytes = makeProfileFrame(p, group, commandNameOrValue, data, fragmentState);

  let commandValue = Number(commandNameOrValue);
  if (Number.isNaN(commandValue)) {
    const mapName = group === 'file' ? 'fileCommands' : group === 'control' ? 'controlCommands' : 'otaCommands';
    commandValue = Number(p[mapName]?.[commandNameOrValue]);
  }

  return {
    profileId: p.id || 'anonymous-profile',
    group,
    category: p.categories[group],
    frameMode: p.frameModes[group],
    commandName: String(commandNameOrValue),
    command: commandValue,
    dataLength: data.length,
    fragmentState,
    frameLength: frameBytes.length,
    frameHex: bytesToHex(frameBytes),
    frameHexSpaced: bytesToHex(frameBytes, ' '),
    crc32Mpeg2: crc32Mpeg2(frameBytes).toString(16).padStart(8, '0')
  };
}

export function buildProfileOtaPlan(profile, packageBytes, options = {}) {
  const p = normalizeProfile(profile);
  const packetSize = Number(options.packetSize || p.ota?.packetSize || 2048);
  const commandName = options.commandName || p.ota?.dataPacketCommandName || 'OTA_DATA_REQUEST';
  const command = p.otaCommands?.[commandName];

  if (!Number.isFinite(Number(command))) {
    throw new Error(`profile OTA data command not found: ${commandName}`);
  }

  const frames = [];
  const totalPackets = Math.ceil(packageBytes.length / packetSize);

  for (let i = 0; i < totalPackets; i++) {
    const start = i * packetSize;
    const end = Math.min(packageBytes.length, start + packetSize);
    const chunk = packageBytes.slice(start, end);
    const packetIndex = i + 1;
    const data = concatBytes(u32le(packetIndex), chunk);
    const fragmentState = totalPackets === 1 ? 0 : (i === 0 ? 1 : (i === totalPackets - 1 ? 3 : 2));
    const frameBytes = makeProfileFrame(p, 'ota', commandName, data, fragmentState);

    frames.push({
      index: packetIndex,
      fragmentState,
      command,
      commandName,
      dataOffset: start,
      dataLength: chunk.length,
      frameLength: frameBytes.length,
      frameHex: bytesToHex(frameBytes),
      frameHexSpaced: bytesToHex(frameBytes, ' '),
      chunkCrc32Mpeg2: crc32Mpeg2(chunk).toString(16).padStart(8, '0')
    });
  }

  return {
    profileId: p.id || 'anonymous-profile',
    packetSize,
    totalSize: packageBytes.length,
    totalPackets: frames.length,
    packageCrc32Mpeg2: crc32Mpeg2(packageBytes).toString(16).padStart(8, '0'),
    dataPacketCommandName: commandName,
    dataPacketCommand: command,
    frames
  };
}
