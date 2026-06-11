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

export function parseWithJsonRules(hexOrBytes, ruleset = {}) {
  const bytes = typeof hexOrBytes === 'string' ? hexToBytes(hexOrBytes) : hexOrBytes;
  const rules = ruleset.rules || [];
  const context = makeContext(bytes);

  for (const rule of rules) {
    if (matchesRule(rule, context)) {
      return {
        matched: true,
        ruleset: ruleset.id || 'anonymous-ruleset',
        ruleId: rule.id || null,
        type: rule.type || 'info',
        commandName: rule.commandName || null,
        status: readField(bytes, rule.statusField),
        packetIndex: readField(bytes, rule.packetIndexField),
        value: buildValue(bytes, rule.valueFields || {}),
        rawHex: bytesToHex(bytes),
        message: rule.message || 'JSON rule matched.'
      };
    }
  }

  return {
    matched: false,
    ruleset: ruleset.id || 'anonymous-ruleset',
    rawHex: bytesToHex(bytes),
    message: 'No JSON rule matched.'
  };
}

function makeContext(bytes) {
  return {
    length: bytes.length,
    category: bytes[0],
    fragmentState: bytes[1],
    payloadLength: readU16le(bytes, 2),
    commandAt4: readU16le(bytes, 4),
    innerLengthAt6: readU16le(bytes, 6),
    statusAt8: readU16le(bytes, 8),
    packetIndexAt10: readU32le(bytes, 10)
  };
}

function matchesRule(rule, context) {
  const when = rule.when || {};
  for (const [key, expected] of Object.entries(when)) {
    if (context[key] !== expected) return false;
  }
  return true;
}

function readField(bytes, field) {
  if (!field) return null;
  const offset = Number(field.offset ?? 0);
  const type = field.type || 'hex';
  if (type === 'u16le') return readU16le(bytes, offset);
  if (type === 'u32le') return readU32le(bytes, offset);
  if (type === 'ascii' || type === 'utf8') {
    const length = Number(field.length ?? Math.max(0, bytes.length - offset));
    return new TextDecoder().decode(bytes.slice(offset, offset + length));
  }
  if (type === 'hex') {
    const length = Number(field.length ?? Math.max(0, bytes.length - offset));
    return bytesToHex(bytes.slice(offset, offset + length));
  }
  return null;
}

function buildValue(bytes, fields) {
  const value = {};
  for (const [name, field] of Object.entries(fields)) {
    value[name] = readField(bytes, field);
  }
  return value;
}
