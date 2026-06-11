export function createRetryScheduler(options = {}) {
  return new RetryScheduler(options);
}

export class RetryScheduler {
  constructor(options = {}) {
    this.retryLimit = Number(options.retryLimit ?? 2);
    this.timeoutMs = Number(options.timeoutMs ?? 300);
    this.frames = new Map();
    this.events = [];
    this.nextQueue = [];
    this.clock = 0;
  }

  loadFrames(frames = []) {
    this.frames.clear();
    this.events = [];
    this.nextQueue = [];
    this.clock = 0;

    for (const frame of frames) {
      const packet = Number(frame.index);
      if (!Number.isFinite(packet)) continue;
      this.frames.set(packet, {
        packet,
        frame,
        status: 'pending',
        attempts: 0,
        lastSentAt: null,
        ackedAt: null,
        lastError: null
      });
      this.nextQueue.push(packet);
    }

    this.log('load', null, { totalPackets: this.frames.size });
    return this.snapshot();
  }

  nextFrame() {
    const packet = this.nextQueue.shift();
    if (packet == null) return null;

    const item = this.frames.get(packet);
    if (!item) return null;

    item.status = 'sent';
    item.attempts += 1;
    item.lastSentAt = this.clock;
    this.log('send', packet, { attempt: item.attempts });

    return item.frame;
  }

  onParsedNotify(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      this.log('notify-unknown', null, { parsed });
      return this.snapshot();
    }

    const packet = normalizePacket(parsed.packetIndex ?? parsed.packet ?? parsed.index);
    const type = parsed.type || 'unknown';

    if (packet == null) {
      this.log('notify-unmapped', null, { type, parsed });
      return this.snapshot();
    }

    const item = this.frames.get(packet);
    if (!item) {
      this.log('notify-untracked', packet, { type, parsed });
      return this.snapshot();
    }

    if (type === 'ack' || type === 'info' && parsed.status === 0) {
      item.status = 'ack';
      item.ackedAt = this.clock;
      item.lastError = null;
      this.log('ack', packet, { parsed });
      return this.snapshot();
    }

    if (type === 'nack' || type === 'error') {
      item.status = 'nack';
      item.lastError = parsed.statusText || parsed.message || type;
      this.log('nack', packet, { parsed });

      if (item.attempts <= this.retryLimit) {
        item.status = 'retry-queued';
        this.nextQueue.unshift(packet);
        this.log('retry-queued', packet, { attempts: item.attempts, retryLimit: this.retryLimit });
      } else {
        item.status = 'failed';
        this.log('failed', packet, { reason: 'retry limit reached' });
      }
      return this.snapshot();
    }

    this.log('notify-ignored', packet, { parsed });
    return this.snapshot();
  }

  tick(ms = this.timeoutMs) {
    this.clock += Number(ms) || 0;

    for (const item of this.frames.values()) {
      if (item.status !== 'sent') continue;
      const elapsed = this.clock - (item.lastSentAt ?? 0);
      if (elapsed < this.timeoutMs) continue;

      this.log('timeout', item.packet, { elapsed, attempt: item.attempts });
      if (item.attempts <= this.retryLimit) {
        item.status = 'retry-queued';
        this.nextQueue.push(item.packet);
        this.log('retry-queued', item.packet, { attempts: item.attempts, retryLimit: this.retryLimit });
      } else {
        item.status = 'failed';
        this.log('failed', item.packet, { reason: 'timeout retry limit reached' });
      }
    }

    return this.snapshot();
  }

  log(type, packet, extra = {}) {
    this.events.push({
      t: this.clock,
      type,
      packet,
      ...extra
    });
  }

  snapshot() {
    const frames = Array.from(this.frames.values()).map((item) => ({
      packet: item.packet,
      status: item.status,
      attempts: item.attempts,
      lastSentAt: item.lastSentAt,
      ackedAt: item.ackedAt,
      lastError: item.lastError
    }));

    const summary = frames.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      retryLimit: this.retryLimit,
      timeoutMs: this.timeoutMs,
      clock: this.clock,
      totalPackets: this.frames.size,
      queue: [...this.nextQueue],
      summary,
      frames,
      events: [...this.events]
    };
  }
}

function normalizePacket(value) {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return null;
  return Math.floor(number);
}

export function runParsedAckScenario({ frames = [], notifications = [], options = {} }) {
  const scheduler = createRetryScheduler(options);
  scheduler.loadFrames(frames);
  const sent = [];

  while (true) {
    const frame = scheduler.nextFrame();
    if (!frame) break;
    sent.push(frame.index);
    const match = notifications.find((item) => Number(item.packetIndex ?? item.packet) === Number(frame.index));
    if (match) scheduler.onParsedNotify(match);
    else scheduler.tick(options.timeoutMs ?? 300);
    if (sent.length > frames.length * ((options.retryLimit ?? 2) + 2)) break;
  }

  return scheduler.snapshot();
}
