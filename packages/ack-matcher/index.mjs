export function createAckMatcher(options = {}) {
  return new AckMatcher(options);
}

export class AckMatcher {
  constructor(options = {}) {
    this.mode = options.mode || 'packet-index';
    this.acceptUnindexedAck = options.acceptUnindexedAck ?? true;
  }

  match(parsedOrNotify, inFlight = {}) {
    const parsed = normalizeParsed(parsedOrNotify);
    const expected = Number(inFlight.packetIndex ?? inFlight.packet ?? inFlight.index);

    if (!parsed) {
      return { matched: false, reason: 'empty parsed notification' };
    }

    const type = parsed.type || inferType(parsed);
    const status = parsed.status ?? parsed.value?.status ?? null;
    const packetIndex = parsed.packetIndex ?? parsed.packet ?? parsed.index ?? parsed.value?.packetIndex ?? null;

    if (this.mode === 'any-ack') {
      return {
        matched: type === 'ack' || status === 0,
        type,
        status,
        packetIndex,
        reason: 'any-ack mode'
      };
    }

    if (packetIndex == null) {
      return {
        matched: this.acceptUnindexedAck && (type === 'ack' || status === 0),
        type,
        status,
        packetIndex,
        reason: this.acceptUnindexedAck ? 'unindexed ack accepted' : 'missing packet index'
      };
    }

    const matched = Number(packetIndex) === expected && (type === 'ack' || status === 0 || type === 'nack' || type === 'error');
    return {
      matched,
      type,
      status,
      packetIndex: Number(packetIndex),
      expectedPacketIndex: expected,
      reason: matched ? 'packet index matched' : 'packet index mismatch'
    };
  }
}

function normalizeParsed(value) {
  if (!value) return null;
  if (value.parsed) return value.parsed;
  if (value.notify?.parsed) return value.notify.parsed;
  if (value.result) return value.result;
  return value;
}

function inferType(parsed) {
  const status = parsed.status ?? parsed.value?.status;
  if (status === 0) return 'ack';
  if (typeof status === 'number' && status !== 0) return 'nack';
  return parsed.type || 'unknown';
}

export function matchAck(parsed, inFlight, options = {}) {
  return createAckMatcher(options).match(parsed, inFlight);
}
