import { createHash } from 'node:crypto';

export function hexToBytes(hex) {
  const compact = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
  if (compact.length % 2 !== 0) throw new Error('hex input must contain an even number of digits');
  return Uint8Array.from(compact.match(/.{2}/g)?.map((pair) => parseInt(pair, 16)) || []);
}

export function bytesToHex(bytes, sep = '') {
  return Array.from(bytes || [], (byte) => byte.toString(16).padStart(2, '0')).join(sep);
}

export function bytesFromInput(input = {}) {
  const mode = input.inputMode || 'text';
  if (mode === 'hex') return hexToBytes(input.hex || '');
  if (mode === 'base64') return new Uint8Array(Buffer.from(input.base64 || '', 'base64'));
  return new TextEncoder().encode(input.text || '');
}

export function sha256Hex(bytes) {
  return createHash('sha256').update(Buffer.from(bytes)).digest('hex');
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

export function readU16le(bytes, offset) {
  if (offset + 2 > bytes.length) throw new Error('u16 out of range');
  return bytes[offset] | (bytes[offset + 1] << 8);
}

export function readU32le(bytes, offset) {
  if (offset + 4 > bytes.length) throw new Error('u32 out of range');
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
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

export function buildSyntheticMcot(input = {}) {
  const images = (input.images && input.images.length ? input.images : [{
    imageId: Number(input.imageId ?? 1),
    flags: Number(input.imageFlags ?? 0),
    bytes: bytesFromInput(input)
  }]).map((image, index) => ({
    imageId: Number(image.imageId ?? index + 1),
    flags: Number(image.flags ?? 0),
    bytes: image.bytes instanceof Uint8Array ? image.bytes : bytesFromInput(image)
  }));

  if (!images.length) throw new Error('at least one image is required');

  const payload = concatBytes(...images.map((image) => image.bytes));
  const rows = images.map((image) => concatBytes(
    u16le(image.imageId),
    u16le(image.flags),
    u32le(image.bytes.length),
    u32le(0)
  ));

  return concatBytes(
    new TextEncoder().encode('MCOT'),
    Uint8Array.of(1, Number(input.flags ?? 0) & 0xff),
    u16le(images.length),
    u32le(crc32Mpeg2(payload)),
    u32le(0),
    ...rows,
    payload
  );
}

export function verifyMcot(bytes) {
  const errors = [];
  const warnings = [];

  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes || []);
  if (bytes.length < 16) {
    return {
      ok: false,
      errors: ['package is too small'],
      warnings,
      size: bytes.length,
      sha256: sha256Hex(bytes)
    };
  }

  const magic = new TextDecoder().decode(bytes.slice(0, 4));
  if (magic !== 'MCOT') errors.push(`unsupported magic: ${magic}`);

  const version = bytes[4];
  const flags = bytes[5];
  const imageCount = readU16le(bytes, 6);
  const expectedPayloadCrc = readU32le(bytes, 8);
  const reserved = readU32le(bytes, 12);
  if (version !== 1) errors.push(`unsupported version: ${version}`);
  if (reserved !== 0) warnings.push('header reserved field is non-zero');
  if (imageCount < 1 || imageCount > 64) errors.push(`invalid image count: ${imageCount}`);

  const tableOffset = 16;
  const tableSize = imageCount * 12;
  const payloadOffset = tableOffset + tableSize;
  if (payloadOffset > bytes.length) errors.push('truncated image table');

  const images = [];
  let cursor = payloadOffset;

  if (!errors.length) {
    for (let i = 0; i < imageCount; i++) {
      const row = tableOffset + i * 12;
      const imageId = readU16le(bytes, row);
      const imageFlags = readU16le(bytes, row + 2);
      const length = readU32le(bytes, row + 4);
      const rowReserved = readU32le(bytes, row + 8);
      if (rowReserved !== 0) warnings.push(`image ${i} reserved field is non-zero`);
      if (length === 0) errors.push(`image ${i} has zero length`);
      if (cursor + length > bytes.length) {
        errors.push(`image ${i} exceeds package length`);
        break;
      }
      const imageBytes = bytes.slice(cursor, cursor + length);
      images.push({
        index: i,
        imageId,
        flags: imageFlags,
        offset: cursor,
        length,
        crc32Mpeg2: crc32Mpeg2(imageBytes).toString(16).padStart(8, '0'),
        sha256: sha256Hex(imageBytes)
      });
      cursor += length;
    }
  }

  if (!errors.length && cursor !== bytes.length) warnings.push('package has trailing bytes');

  const payloadBytes = !errors.length ? bytes.slice(payloadOffset, cursor) : new Uint8Array();
  const actualPayloadCrc = crc32Mpeg2(payloadBytes);

  if (!errors.length && actualPayloadCrc !== expectedPayloadCrc) {
    errors.push(`payload CRC mismatch: expected ${expectedPayloadCrc.toString(16).padStart(8, '0')}, actual ${actualPayloadCrc.toString(16).padStart(8, '0')}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    magic,
    version,
    flags,
    imageCount,
    size: bytes.length,
    sha256: sha256Hex(bytes),
    payloadOffset,
    payloadSize: Math.max(0, cursor - payloadOffset),
    expectedPayloadCrc32Mpeg2: expectedPayloadCrc.toString(16).padStart(8, '0'),
    actualPayloadCrc32Mpeg2: actualPayloadCrc.toString(16).padStart(8, '0'),
    images
  };
}
