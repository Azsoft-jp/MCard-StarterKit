/*
 * MCard-StarterKit web server
 *
 * Pure Node.js server. No vendor cloud access. No real BLE transfer by default.
 * Provides local media package validation, FILE frame expansion, transfer simulation,
 * and static dashboard UI.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(__dirname, 'public');

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function crc32mpeg2(buf) {
  let crc = 0xffffffff >>> 0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= (buf[i] << 24) >>> 0;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x80000000) !== 0
        ? ((crc << 1) ^ 0x04c11db7) >>> 0
        : (crc << 1) >>> 0;
    }
  }
  return crc >>> 0;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function dataUrlToBuffer(dataUrl) {
  const m = /^data:\w+\/[-+.\w]+;base64,(.*)$/i.exec(String(dataUrl || ''));
  if (!m) throw new Error('Invalid data URL');
  return Buffer.from(m[1], 'base64');
}

function sanitizeName(name) {
  return String(name || 'payload.bin')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 64) || 'payload.bin';
}

function extractMediaBytes(pkg) {
  if (!pkg || typeof pkg !== 'object') throw new Error('Invalid package');

  if (pkg.animation && Array.isArray(pkg.animation.frames)) {
    const parts = [];
    for (const frame of pkg.animation.frames) {
      if (!frame.dataUrl) throw new Error('Animation frame missing dataUrl');
      parts.push(dataUrlToBuffer(frame.dataUrl));
    }
    return Buffer.concat(parts);
  }

  if (pkg.image && pkg.image.dataUrl) {
    return dataUrlToBuffer(pkg.image.dataUrl);
  }

  if (pkg.type === 'static' && pkg.image && pkg.image.dataUrl) {
    return dataUrlToBuffer(pkg.image.dataUrl);
  }

  throw new Error('Unknown media package format');
}

function u16le(value) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(value & 0xffff, 0);
  return b;
}

function u32le(value) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value >>> 0, 0);
  return b;
}

function calculatePacketSize(mtu = 247) {
  let packetSize = 50 * (mtu - 7) - 8;
  if (packetSize < 256) packetSize = 256;
  if (packetSize > 10240) packetSize = 10240;
  return packetSize;
}

function makeOuterFrame(category, fragmentState, inner) {
  const outer = Buffer.alloc(4);
  outer.writeUInt8(category & 0xff, 0);
  outer.writeUInt8(fragmentState & 0xff, 1);
  outer.writeUInt16LE(inner.length, 2);
  return Buffer.concat([outer, inner]);
}

function makeLengthPrefixedCommand(category, command, data, fragmentState = 0) {
  const inner = Buffer.concat([u16le(command), u16le(data.length), data]);
  return makeOuterFrame(category, fragmentState, inner);
}

function buildFileTransferPlan(mediaBytes, options = {}) {
  const mtu = Number(options.mtu || 247);
  const filename = sanitizeName(options.filename || 'badge-media.mcpkg');
  const packetSize = calculatePacketSize(mtu);

  const padLength = (4 - (mediaBytes.length % 4)) % 4;
  const padded = Buffer.concat([mediaBytes, Buffer.alloc(padLength, 0x00)]);
  const crc = crc32mpeg2(padded);
  const crcBuf = u32le(crc);
  const fileData = Buffer.concat([padded, crcBuf]);

  const frames = [];

  // START request, FILE_INFO request, FILE_SEND_START request are generated as simulation metadata.
  // Data packet command is 0x0008 in this starter-kit simulation.
  const packetCount = Math.ceil(fileData.length / packetSize);
  for (let i = 0; i < packetCount; i++) {
    const start = i * packetSize;
    const end = Math.min(fileData.length, start + packetSize);
    const chunk = fileData.slice(start, end);
    const indexBuf = u32le(i + 1);
    const data = Buffer.concat([indexBuf, chunk]);
    const frag = packetCount === 1 ? 0 : (i === 0 ? 1 : (i === packetCount - 1 ? 3 : 2));
    const frame = makeLengthPrefixedCommand(0x04, 0x0008, data, frag);
    frames.push({
      index: i + 1,
      fragmentState: frag,
      dataOffset: start,
      dataLength: chunk.length,
      command: 8,
      frameLength: frame.length,
      frameHex: frame.toString('hex'),
      chunkCrc32Mpeg2: crc32mpeg2(chunk).toString(16).padStart(8, '0')
    });
  }

  return {
    filename,
    mtu,
    packetSize,
    originalSize: mediaBytes.length,
    paddedSize: padded.length,
    totalSize: fileData.length,
    totalPackets: frames.length,
    payloadCrc32Mpeg2: crc.toString(16).padStart(8, '0'),
    sha256: sha256(fileData),
    phases: [
      { phase: 'START_REQUEST', command: 0, description: 'Check device storage and file type' },
      { phase: 'FILE_INFO_REQUEST', command: 13, description: 'Optional file info negotiation' },
      { phase: 'FILE_SEND_START_REQUEST', command: 2, description: 'Announce filename and length' },
      { phase: 'FILE_SEND_DATA_REQUEST', command: 8, description: 'Send packet frames listed below' },
      { phase: 'FILE_SEND_END_REQUEST', command: 6, description: 'Finalize file payload' },
      { phase: 'END_REQUEST', command: 8, description: 'Close transfer session in downstream transport' }
    ],
    frames
  };
}

function buildFileFrames(pkg, input = {}) {
  const bytes = extractMediaBytes(pkg);
  return buildFileTransferPlan(bytes, {
    mtu: input.mtu || 247,
    filename: input.filename || `${pkg.name || 'badge-media'}.mcpkg`
  });
}


function simulateAckRetry(plan, options = {}) {
  const lossEvery = Number(options.lossEvery || 0);
  const retryLimit = Number(options.retryLimit || 2);
  const ackDelayMs = Number(options.ackDelayMs || 30);
  const timeoutMs = Number(options.timeoutMs || 300);

  const log = [];
  const final = [];
  let virtualTime = 0;
  let retryCount = 0;
  let failed = 0;

  for (const frame of plan.frames) {
    let acknowledged = false;

    for (let attempt = 0; attempt <= retryLimit; attempt++) {
      const isRetry = attempt > 0;
      if (isRetry) retryCount += 1;

      log.push({
        t: virtualTime,
        type: isRetry ? 'retry-send' : 'send',
        packet: frame.index,
        attempt,
        bytes: frame.frameLength || Math.ceil(frame.frameHex.length / 2)
      });

      const shouldLose = lossEvery > 0 && frame.index % lossEvery === 0 && attempt === 0;
      if (shouldLose) {
        virtualTime += timeoutMs;
        log.push({
          t: virtualTime,
          type: 'timeout',
          packet: frame.index,
          attempt,
          message: 'simulated missing ACK'
        });
        continue;
      }

      virtualTime += ackDelayMs;
      log.push({
        t: virtualTime,
        type: 'ack',
        packet: frame.index,
        attempt,
        ackHex: '04 00 06 00 09 00 02 00 00 00',
        message: 'simulated ACK'
      });
      acknowledged = true;
      break;
    }

    final.push({
      packet: frame.index,
      acknowledged,
      attempts: acknowledged ? undefined : retryLimit + 1
    });

    if (!acknowledged) failed += 1;
  }

  return {
    ok: failed === 0,
    totalPackets: plan.frames.length,
    retryCount,
    failed,
    virtualDurationMs: virtualTime,
    final,
    log
  };
}

function simulateTransfer(plan, options = {}) {
  const lossEvery = Number(options.lossEvery || 0);
  const retryLimit = Number(options.retryLimit || 2);
  const events = [];
  const missing = [];
  let sent = 0;
  let retries = 0;

  for (const frame of plan.frames) {
    sent += 1;
    const lost = lossEvery > 0 && frame.index % lossEvery === 0;
    if (lost) {
      events.push({ type: 'lost', packet: frame.index, message: `Packet ${frame.index} marked lost by simulator` });
      missing.push(frame.index);
    } else {
      events.push({ type: 'ack', packet: frame.index, message: `Packet ${frame.index} acknowledged` });
    }
  }

  const recovered = [];
  for (const packet of missing) {
    for (let attempt = 1; attempt <= retryLimit; attempt++) {
      retries += 1;
      events.push({ type: 'retry', packet, attempt, message: `Retry packet ${packet}, attempt ${attempt}` });
      if (attempt === 1) {
        recovered.push(packet);
        events.push({ type: 'ack', packet, attempt, message: `Packet ${packet} recovered` });
        break;
      }
    }
  }

  return {
    ok: missing.length === recovered.length,
    sent,
    lost: missing.length,
    recovered: recovered.length,
    retries,
    events
  };
}







async function verifyLocalOtaApi(input = {}) {
  const mod = await import('../../packages/ota-local-verifier/index.mjs');
  const bytes = mod.bytesFromInput(input);
  return mod.verifyMcot(bytes);
}

async function buildLocalOtaApi(input = {}) {
  const mod = await import('../../packages/ota-local-verifier/index.mjs');
  const bytes = mod.buildSyntheticMcot(input);
  return {
    ok: true,
    size: bytes.length,
    sha256: mod.sha256Hex(bytes),
    hex: mod.bytesToHex(bytes, ' '),
    compactHex: mod.bytesToHex(bytes),
    verification: mod.verifyMcot(bytes)
  };
}




async function estimateTransferApi(input = {}) {
  const mod = await import('../../packages/transfer-estimator/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  return mod.estimateTransferTime(input.plan || {}, profile, input.options || input);
}

async function parseJsonRuleApi(input = {}) {
  const mod = await import('../../packages/json-rule-parser/index.mjs');
  return mod.parseWithJsonRules(input.hex || '', input.ruleset || {});
}

async function adaptTransportLogApi(input = {}) {
  const mod = await import('../../packages/transport-adapters/index.mjs');
  if (input.adapter === 'windows-bridge-log') return mod.normalizeWindowsBridgeLog(input.text || input.log || '');
  return mod.normalizeWebBluetoothLog(input.log || input.events || []);
}

async function simulateEmulatorNotifyApi(input = {}) {
  const mod = await import('../../packages/emulator-notify/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  if (input.frames) return mod.simulateNotifySequence(input.frames, profile, input.options || {});
  return mod.simulateNotifyForFrame(input.hex || input.frameHex || '', profile, input.options || {});
}

async function migrateWorkspaceApi(input = {}) {
  const mod = await import('../../packages/workspace/index.mjs');
  return mod.migrateWorkspace(input.workspace || input);
}

async function parseMappedResponseApi(input = {}) {
  const mod = await import('../../packages/response-mapping/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  const group = input.group || 'file';
  if (group === 'ota') return mod.parseOtaResponse(input.hex || '', profile);
  return mod.parseFileResponse(input.hex || '', profile);
}

async function parseControlResponseApi(input = {}) {
  const mod = await import('../../packages/control-response-mapping/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  return mod.parseControlResponse(input.hex || '', profile);
}

async function buildProfileCommandFrameApi(input = {}) {
  const mod = await import('../../packages/frame-builder/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  return mod.buildProfileCommandFrame(profile, input);
}

async function buildProfileOtaPlanApi(input = {}) {
  const mod = await import('../../packages/frame-builder/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  const bytes = mod.bytesFromInput(input);
  return mod.buildProfileOtaPlan(profile, bytes, input);
}

async function buildProfileMappedFileFramesApi(pkg, input = {}) {
  const mod = await import('../../packages/frame-builder/index.mjs');
  const profile = input.profile || readJsonFileSafe(input.profilePath || 'examples/profiles/monicard-like.sample.json') || {};
  const bytes = extractMediaBytes(pkg);
  return mod.buildProfileFileTransferFrames(profile, new Uint8Array(bytes), {
    mtu: input.mtu || profile.transfer?.defaultMtu || 247
  });
}

function readJsonFileSafe(rel) {
  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT) || !fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function listProfiles() {
  const dir = path.join(ROOT, 'examples/profiles');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const rel = `examples/profiles/${name}`;
      try {
        const data = readJsonFileSafe(rel);
        return {
          id: data.id || name.replace(/\.json$/, ''),
          title: data.title || name,
          path: rel,
          notifyParsers: data.notifyParsers || []
        };
      } catch {
        return { id: name.replace(/\.json$/, ''), title: name, path: rel, notifyParsers: [] };
      }
    });
}

async function runRetrySchedulerApi(input) {
  const mod = await import('../../packages/retry-scheduler/index.mjs');
  return mod.runParsedAckScenario(input || {});
}

async function parseNotifyApi(input) {
  const mod = await import('../../packages/notify-parsers/index.mjs');
  if (input.parserId === 'auto') {
    return mod.parseNotifyWithFallback(input.hex || '', input.parserIds);
  }
  return mod.parseNotify(input.hex || '', input.parserId || 'raw-hex');
}

async function listNotifyParsersApi() {
  const mod = await import('../../packages/notify-parsers/index.mjs');
  return mod.listNotifyParsers();
}

function listDocs() {
  return [
    'docs/reference/file-frame-simulator.md',
    'docs/guides/web-bluetooth-opt-in.md',
    'docs/guides/release-checklist.md',
    'TASKS.md',
    'ROADMAP.md',
    'CHANGELOG.md',
    'docs-ja/reference/FILEフレーム_シミュレータ.md',
    'docs-ja/guides/Web_Bluetooth_OptIn.md',
    'docs-ja/guides/公開前チェックリスト.md',
  ].filter((p) => fs.existsSync(path.join(ROOT, p))).map((p) => ({ path: p, title: path.basename(p) }));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const raw = decodeURIComponent(url.pathname);
  const rel = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
  const candidates = [
    path.join(PUBLIC, rel),
    path.join(ROOT, rel)
  ];
  const file = candidates.find((p) => p.startsWith(PUBLIC) || p.startsWith(ROOT));
  const chosen = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  if (!chosen) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  const ext = path.extname(chosen).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
  };
  const data = fs.readFileSync(chosen);
  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
  res.end(data);
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        app: 'MCard-StarterKit',
        mode: 'local-only',
        bleEnabledByDefault: false,
        vendorCloud: false
      });
      return;
    }


    if (req.method === 'GET' && url.pathname === '/api/profiles') {
      sendJson(res, 200, { ok: true, profiles: listProfiles() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/profile') {
      const profilePath = url.searchParams.get('path') || 'examples/profiles/monicard-like.sample.json';
      const data = readJsonFileSafe(profilePath);
      if (!data) throw new Error('profile not found');
      sendJson(res, 200, { ok: true, profile: data });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/docs') {
      sendJson(res, 200, { ok: true, docs: listDocs() });
      return;
    }



    if (req.method === 'POST' && url.pathname === '/api/retry/run') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await runRetrySchedulerApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/notify/parse-and-schedule') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      const parsed = await parseNotifyApi({ parserId: input.parserId || 'auto', hex: input.hex || '' });
      const schedule = await runRetrySchedulerApi({
        frames: input.frames || [],
        notifications: [parsed],
        options: input.options || {}
      });
      sendJson(res, 200, { ok: true, parsed, schedule });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/notify/parsers') {
      sendJson(res, 200, { ok: true, parsers: await listNotifyParsersApi() });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/notify/parse') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await parseNotifyApi(input) });
      return;
    }




    if (req.method === 'POST' && url.pathname === '/api/ota/verify-local') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, verification: await verifyLocalOtaApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ota/build-local') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, await buildLocalOtaApi(input));
      return;
    }




    if (req.method === 'POST' && url.pathname === '/api/transfer/estimate') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, estimate: await estimateTransferApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/json-rules/parse') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await parseJsonRuleApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/transport/adapt-log') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, log: await adaptTransportLogApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/emulator/notify') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await simulateEmulatorNotifyApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/workspace/migrate') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, workspace: await migrateWorkspaceApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/response/parse') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await parseMappedResponseApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/control/parse-response') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, result: await parseControlResponseApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/frame/build-profiled') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, frame: await buildProfileCommandFrameApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ota/frames-profiled') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      sendJson(res, 200, { ok: true, plan: await buildProfileOtaPlanApi(input) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/file/frames-profiled') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      const pkg = input.package;
      if (!pkg) throw new Error('Missing package');
      sendJson(res, 200, await buildProfileMappedFileFramesApi(pkg, input));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/file/frames') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      const pkg = input.package;
      if (!pkg) throw new Error('Missing package');
      sendJson(res, 200, buildFileFrames(pkg, input));
      return;
    }


    if (req.method === 'POST' && url.pathname === '/api/file/simulate-ack-retry') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      const pkg = input.package;
      if (!pkg) throw new Error('Missing package');
      const plan = buildFileFrames(pkg, input);
      const ackSimulation = simulateAckRetry(plan, input.simulation || {});
      sendJson(res, 200, { plan, ackSimulation });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/file/simulate-transfer') {
      const input = JSON.parse((await readBody(req)).toString('utf8') || '{}');
      const pkg = input.package;
      if (!pkg) throw new Error('Missing package');
      const plan = buildFileFrames(pkg, input);
      const simulation = simulateTransfer(plan, input.simulation || {});
      sendJson(res, 200, { plan, simulation });
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
}

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => handleRequest(req, res)).listen(PORT, () => {
  console.log(`MCard-StarterKit server listening on port ${PORT}`);
});
