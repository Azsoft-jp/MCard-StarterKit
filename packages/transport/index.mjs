export function createMemoryTransport(options = {}) {
  return new MemoryTransport(options);
}

export class MemoryTransport {
  constructor(options = {}) {
    this.id = options.id || `memory-${Date.now().toString(36)}`;
    this.connected = false;
    this.log = [];
    this.notifyHandlers = new Set();
    this.writeHandler = options.writeHandler || null;
  }

  async connect() {
    this.connected = true;
    this.logEvent('connect');
    return this.info();
  }

  async disconnect() {
    this.connected = false;
    this.logEvent('disconnect');
    return this.info();
  }

  async writeFrame(frame) {
    if (!this.connected) throw new Error('transport is not connected');
    const frameHex = typeof frame === 'string' ? frame : frame.frameHex || frame.hex || '';
    const record = {
      type: 'write',
      frameHex,
      frameIndex: typeof frame === 'object' ? frame.index ?? null : null,
      at: new Date().toISOString()
    };
    this.log.push(record);

    if (this.writeHandler) {
      const notify = await this.writeHandler(frame);
      if (notify) await this.emitNotify(notify);
    }

    return record;
  }

  async emitNotify(notify) {
    const record = {
      type: 'notify',
      notify,
      at: new Date().toISOString()
    };
    this.log.push(record);
    for (const handler of this.notifyHandlers) {
      await handler(notify);
    }
    return record;
  }

  onNotify(handler) {
    this.notifyHandlers.add(handler);
    return () => this.notifyHandlers.delete(handler);
  }

  exportLog() {
    return {
      schema: 'mcard-starterkit.transport-log.v1',
      id: this.id,
      connected: this.connected,
      events: [...this.log]
    };
  }

  info() {
    return {
      id: this.id,
      type: 'memory',
      connected: this.connected
    };
  }

  logEvent(type, extra = {}) {
    this.log.push({ type, at: new Date().toISOString(), ...extra });
  }
}

export function createTransportSession({ transport, frames = [], ackMatcher, retryLimit = 2 } = {}) {
  if (!transport) throw new Error('transport is required');
  return new TransportSession({ transport, frames, ackMatcher, retryLimit });
}

export class TransportSession {
  constructor({ transport, frames, ackMatcher, retryLimit }) {
    this.transport = transport;
    this.frames = frames;
    this.ackMatcher = ackMatcher;
    this.retryLimit = retryLimit;
    this.cursor = 0;
    this.paused = false;
    this.cancelled = false;
    this.inFlight = null;
    this.results = [];
    this.events = [];

    this.unsubscribe = this.transport.onNotify(async (notify) => {
      await this.handleNotify(notify);
    });
  }

  async start() {
    await this.transport.connect();
    this.cancelled = false;
    this.paused = false;
    await this.sendNext();
    return this.snapshot();
  }

  pause() {
    this.paused = true;
    this.log('pause');
    return this.snapshot();
  }

  resume() {
    this.paused = false;
    this.log('resume');
    return this.sendNext();
  }

  cancel() {
    this.cancelled = true;
    this.paused = false;
    this.inFlight = null;
    this.log('cancel');
    return this.snapshot();
  }

  async sendNext() {
    if (this.cancelled || this.paused) return this.snapshot();
    if (this.inFlight) return this.snapshot();
    if (this.cursor >= this.frames.length) {
      this.log('complete');
      return this.snapshot();
    }

    const frame = this.frames[this.cursor];
    const packetIndex = frame.index ?? frame.packet ?? this.cursor + 1;
    const attempt = (this.results.find((item) => item.packetIndex === packetIndex)?.attempts || 0) + 1;
    this.inFlight = { frame, packetIndex, attempt };
    this.upsertResult(packetIndex, { status: 'sent', attempts: attempt });
    this.log('send', { packetIndex, attempt });
    await this.transport.writeFrame(frame);
    return this.snapshot();
  }

  async handleNotify(notify) {
    if (!this.inFlight) {
      this.log('notify-without-inflight', { notify });
      return this.snapshot();
    }

    const result = this.ackMatcher ? this.ackMatcher.match(notify, this.inFlight) : { matched: true, type: 'ack' };
    this.log('notify-match', { packetIndex: this.inFlight.packetIndex, result });

    if (!result.matched) return this.snapshot();

    if (result.type === 'ack' || result.status === 0) {
      this.upsertResult(this.inFlight.packetIndex, { status: 'ack', ack: result });
      this.cursor += 1;
      this.inFlight = null;
      await this.sendNext();
      return this.snapshot();
    }

    if (result.type === 'nack' || result.type === 'error') {
      const packetIndex = this.inFlight.packetIndex;
      const attempt = this.inFlight.attempt;
      if (attempt <= this.retryLimit) {
        this.upsertResult(packetIndex, { status: 'retry-queued', lastError: result });
        this.inFlight = null;
        await this.sendNext();
      } else {
        this.upsertResult(packetIndex, { status: 'failed', lastError: result });
        this.inFlight = null;
      }
      return this.snapshot();
    }

    return this.snapshot();
  }

  upsertResult(packetIndex, patch) {
    let existing = this.results.find((item) => item.packetIndex === packetIndex);
    if (!existing) {
      existing = { packetIndex, status: 'pending', attempts: 0 };
      this.results.push(existing);
    }
    Object.assign(existing, patch);
  }

  log(type, extra = {}) {
    this.events.push({ type, at: new Date().toISOString(), ...extra });
  }

  snapshot() {
    return {
      cursor: this.cursor,
      paused: this.paused,
      cancelled: this.cancelled,
      inFlight: this.inFlight ? {
        packetIndex: this.inFlight.packetIndex,
        attempt: this.inFlight.attempt
      } : null,
      totalFrames: this.frames.length,
      results: [...this.results],
      events: [...this.events],
      transport: this.transport.info()
    };
  }
}
