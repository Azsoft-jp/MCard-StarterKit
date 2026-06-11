export function hexToBytes(hex) {
  const compact = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
  if (!compact || compact.length % 2 !== 0) {
    throw new Error('hex input must contain an even number of hex digits');
  }
  const out = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) {
    out[i / 2] = parseInt(compact.slice(i, i + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes) {
  return Array.from(bytes || [], (byte) => byte.toString(16).padStart(2, '0')).join(' ');
}

function readU16le(bytes, offset) {
  if (offset + 2 > bytes.length) return null;
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32le(bytes, offset) {
  if (offset + 4 > bytes.length) return null;
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

export const notifyParsers = {
  'raw-hex': {
    id: 'raw-hex',
    title: 'Raw Hex Logger',
    description: 'Always records the notification as an unknown raw hex payload.',
    parse(bytes) {
      return {
        matched: true,
        type: 'unknown',
        parser: 'raw-hex',
        rawHex: bytesToHex(bytes),
        message: 'Raw notification captured.'
      };
    }
  },

  'json-line': {
    id: 'json-line',
    title: 'JSON Notify Parser',
    description: 'Parses UTF-8 JSON notification payloads such as {"type":"ack","packet":1}.',
    parse(bytes) {
      const text = new TextDecoder().decode(bytes).trim();
      if (!text.startsWith('{') || !text.endsWith('}')) return { matched: false };

      try {
        const data = JSON.parse(text);
        const type = data.type || (data.ack != null ? 'ack' : data.error != null ? 'error' : 'info');
        return {
          matched: true,
          type,
          parser: 'json-line',
          packetIndex: data.packet ?? data.packetIndex ?? null,
          command: data.command ?? null,
          status: data.status ?? null,
          data,
          rawText: text,
          message: `JSON notification parsed as ${type}.`
        };
      } catch {
        return { matched: false };
      }
    }
  },

  'length-prefixed-command': {
    id: 'length-prefixed-command',
    title: 'Generic Length-prefixed Command Parser',
    description: 'Parses outer frame + length-prefixed inner command responses.',
    parse(bytes, context = {}) {
      if (bytes.length < 8) return { matched: false };
      const category = bytes[0];
      const fragmentState = bytes[1];
      const payloadLength = readU16le(bytes, 2);
      if (payloadLength == null) return { matched: false };

      const payload = bytes.slice(4);
      if ((fragmentState === 0 || fragmentState === 1) && payload.length !== payloadLength) {
        return { matched: false };
      }

      const command = readU16le(payload, 0);
      const innerLength = readU16le(payload, 2);
      if (command == null || innerLength == null) return { matched: false };

      const data = payload.slice(4);
      if (data.length !== innerLength) return { matched: false };

      let status = data.length >= 2 ? readU16le(data, 0) : null;
      let packetIndex = data.length >= 6 ? readU32le(data, 2) : null;
      const ackCommands = context.ackCommands || [1, 3, 5, 7, 9, 11, 14, 39, 41, 43];
      const errorCommands = context.errorCommands || [];

      let type = 'info';
      if (ackCommands.includes(command)) type = status === 0 || status == null ? 'ack' : 'nack';
      if (errorCommands.includes(command)) type = 'error';

      return {
        matched: true,
        parser: 'length-prefixed-command',
        type,
        category,
        fragmentState,
        command,
        status,
        packetIndex,
        dataLength: data.length,
        dataHex: bytesToHex(data),
        rawHex: bytesToHex(bytes),
        message: `Length-prefixed command ${command} parsed as ${type}.`
      };
    }
  },

  'monicard-like-file-ack': {
    id: 'monicard-like-file-ack',
    title: 'MoniCard-like FILE ACK Sample',
    description: 'Sample parser for MoniCard-like FILE response frames. Provided as a profile example, not vendor code.',
    parse(bytes) {
      const base = notifyParsers['length-prefixed-command'].parse(bytes, {
        ackCommands: [1, 3, 5, 7, 9, 11, 14, 16],
      });
      if (!base.matched) return { matched: false };

      if (base.category !== 0x04) return { matched: false };

      const commandNames = {
        1: 'START_RESPONSE',
        3: 'FILE_SEND_START_RESPONSE',
        5: 'FILE_SEND_DATA_RESPONSE',
        7: 'FILE_SEND_END_RESPONSE',
        9: 'END_RESPONSE',
        11: 'LOSE_CHECK_RESPONSE',
        14: 'FILE_INFO_RESPONSE',
        16: 'FILE_PHOTO_PREVIEW_DATA_RESPONSE'
      };

      const statusText = {
        0: 'success',
        1: 'storage-insufficient',
        2: 'unsupported-file-type',
        3: 'file-too-large',
        4: 'invalid-filename',
        5: 'verify-failed-or-retry'
      };

      return {
        ...base,
        parser: 'monicard-like-file-ack',
        profile: 'monicard-like.sample',
        commandName: commandNames[base.command] || `FILE_RESPONSE_${base.command}`,
        statusText: statusText[base.status] || (base.status == null ? 'not-present' : 'unknown-status'),
        message: `MoniCard-like FILE response ${commandNames[base.command] || base.command}: ${statusText[base.status] || base.status}.`
      };
    }
  },

  'monicard-like-control': {
    id: 'monicard-like-control',
    title: 'MoniCard-like CONTROL Sample',
    description: 'Sample parser for simple CONTROL notifications using category 0x1f.',
    parse(bytes) {
      if (bytes.length < 6) return { matched: false };
      const category = bytes[0];
      if (category !== 0x1f) return { matched: false };

      const fragmentState = bytes[1];
      const payloadLength = readU16le(bytes, 2);
      const payload = bytes.slice(4);
      if ((fragmentState === 0 || fragmentState === 1) && payload.length !== payloadLength) {
        return { matched: false };
      }

      const command = readU16le(payload, 0);
      const data = payload.slice(2);
      const commandNames = {
        19: 'SERIAL_NUMBER_RESPONSE',
        21: 'VERSION_RESPONSE',
        23: 'BATTERY_RESPONSE',
        33: 'STORAGE_INFO_RESPONSE',
        41: 'CONTROL_INFO_RESPONSE',
        43: 'CONTROL_INFO_WRITE_RESPONSE',
        51: 'CARD_INFO_RESPONSE',
        53: 'CARD_INFO_WRITE_RESPONSE',
        61: 'CAROUSEL_RESPONSE',
        63: 'CAROUSEL_WRITE_RESPONSE'
      };

      return {
        matched: true,
        parser: 'monicard-like-control',
        profile: 'monicard-like.sample',
        type: 'info',
        category,
        fragmentState,
        command,
        commandName: commandNames[command] || `CONTROL_RESPONSE_${command}`,
        dataLength: data.length,
        dataHex: bytesToHex(data),
        rawHex: bytesToHex(bytes),
        message: `MoniCard-like CONTROL response ${commandNames[command] || command}.`
      };
    }
  }
};

export function listNotifyParsers() {
  return Object.values(notifyParsers).map(({ id, title, description }) => ({ id, title, description }));
}

export function parseNotify(bytesOrHex, parserId = 'raw-hex', context = {}) {
  const bytes = typeof bytesOrHex === 'string' ? hexToBytes(bytesOrHex) : bytesOrHex;
  const parser = notifyParsers[parserId];
  if (!parser) {
    throw new Error(`unknown notify parser: ${parserId}`);
  }
  const result = parser.parse(bytes, context);
  if (!result.matched) {
    return {
      matched: false,
      type: 'unknown',
      parser: parserId,
      rawHex: bytesToHex(bytes),
      message: 'Parser did not match this notification.'
    };
  }
  return result;
}

export function parseNotifyWithFallback(bytesOrHex, parserIds = ['monicard-like-file-ack', 'monicard-like-control', 'json-line', 'length-prefixed-command', 'raw-hex']) {
  const bytes = typeof bytesOrHex === 'string' ? hexToBytes(bytesOrHex) : bytesOrHex;
  for (const parserId of parserIds) {
    const result = parseNotify(bytes, parserId);
    if (result.matched) return result;
  }
  return parseNotify(bytes, 'raw-hex');
}
