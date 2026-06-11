const $ = (s) => document.querySelector(s);

async function getJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'request failed');
  return data;
}

async function loadSample() {
  const res = await fetch('/examples/media/example-image.mcpkg.json');
  const sample = await res.json();
  $('#packageJson').value = JSON.stringify(sample, null, 2);
  $('#output').textContent = 'Sample package loaded.';
}

let latestFilePlan = null;
let schedulerState = null;
let bleDevice = null;
let bleServer = null;
let bleWriteCharacteristic = null;
let bleNotifyCharacteristic = null;
let bleLog = [];

async function buildFrames() {
  const pkg = JSON.parse($('#packageJson').value);
  const data = await getJson('/api/file/frames', {
    method: 'POST',
    body: JSON.stringify({
      package: pkg,
      mtu: Number($('#mtu').value || 247),
      filename: `${pkg.name || 'badge-media'}.mcpkg`
    })
  });
  latestFilePlan = data;
  $('#output').textContent = JSON.stringify({
    totalSize: data.totalSize,
    packetSize: data.packetSize,
    totalPackets: data.totalPackets,
    payloadCrc32Mpeg2: data.payloadCrc32Mpeg2,
    sha256: data.sha256,
    firstFrame: data.frames[0]
  }, null, 2);
}

async function simulateTransfer() {
  const pkg = JSON.parse($('#packageJson').value);
  const data = await getJson('/api/file/simulate-transfer', {
    method: 'POST',
    body: JSON.stringify({
      package: pkg,
      mtu: Number($('#mtu').value || 247),
      filename: `${pkg.name || 'badge-media'}.mcpkg`,
      simulation: {
        lossEvery: Number($('#lossEvery').value || 0),
        retryLimit: 2
      }
    })
  });
  latestFilePlan = data.plan;
  $('#output').textContent = JSON.stringify({
    plan: {
      totalSize: data.plan.totalSize,
      totalPackets: data.plan.totalPackets,
      packetSize: data.plan.packetSize,
      payloadCrc32Mpeg2: data.plan.payloadCrc32Mpeg2
    },
    simulation: data.simulation,
    firstFrame: data.plan.frames[0]
  }, null, 2);
}





function makeBrowserScheduler(frames = []) {
  return {
    retryLimit: Number($('#schedulerRetryLimit')?.value || 2),
    timeoutMs: Number($('#schedulerTimeoutMs')?.value || 300),
    clock: 0,
    queue: frames.map((frame) => frame.index),
    frames: frames.map((frame) => ({
      packet: frame.index,
      frame,
      status: 'pending',
      attempts: 0,
      lastSentAt: null,
      ackedAt: null,
      lastError: null
    })),
    events: [{ t: 0, type: 'load', totalPackets: frames.length }]
  };
}

function schedulerSnapshot() {
  if (!schedulerState) return null;
  const summary = {};
  for (const item of schedulerState.frames) {
    summary[item.status] = (summary[item.status] || 0) + 1;
  }
  return {
    retryLimit: schedulerState.retryLimit,
    timeoutMs: schedulerState.timeoutMs,
    clock: schedulerState.clock,
    queue: schedulerState.queue,
    summary,
    frames: schedulerState.frames.map(({ packet, status, attempts, lastSentAt, ackedAt, lastError }) => ({
      packet, status, attempts, lastSentAt, ackedAt, lastError
    })),
    events: schedulerState.events
  };
}

function renderScheduler() {
  $('#schedulerOutput').textContent = JSON.stringify(schedulerSnapshot(), null, 2);
}

function schedulerLog(type, packet, extra = {}) {
  schedulerState.events.push({ t: schedulerState.clock, type, packet, ...extra });
}

function loadSchedulerFromFrames() {
  if (!latestFilePlan?.frames?.length) throw new Error('Build FILE frames first.');
  schedulerState = makeBrowserScheduler(latestFilePlan.frames);
  renderScheduler();
}

function schedulerSendNext() {
  if (!schedulerState) throw new Error('Load scheduler first.');
  const packet = schedulerState.queue.shift();
  if (!packet) {
    schedulerLog('idle', null, {});
    renderScheduler();
    return;
  }
  const item = schedulerState.frames.find((x) => x.packet === packet);
  item.status = 'sent';
  item.attempts += 1;
  item.lastSentAt = schedulerState.clock;
  schedulerLog('send', packet, { attempt: item.attempts });

  if ($('#bleFrameHex') && item.frame?.frameHex) {
    $('#bleFrameHex').value = item.frame.frameHex;
  }

  renderScheduler();
}

function schedulerApplyParsed(parsed) {
  if (!schedulerState) throw new Error('Load scheduler first.');
  const packet = Number(parsed.packetIndex ?? parsed.packet ?? parsed.index);
  if (!Number.isFinite(packet) || packet < 1) {
    schedulerLog('notify-unmapped', null, { parsed });
    renderScheduler();
    return;
  }

  const item = schedulerState.frames.find((x) => x.packet === packet);
  if (!item) {
    schedulerLog('notify-untracked', packet, { parsed });
    renderScheduler();
    return;
  }

  if (parsed.type === 'ack' || (parsed.type === 'info' && parsed.status === 0)) {
    item.status = 'ack';
    item.ackedAt = schedulerState.clock;
    item.lastError = null;
    schedulerLog('ack', packet, { parsed });
  } else if (parsed.type === 'nack' || parsed.type === 'error') {
    item.status = 'nack';
    item.lastError = parsed.statusText || parsed.message || parsed.type;
    schedulerLog('nack', packet, { parsed });
    if (item.attempts <= schedulerState.retryLimit) {
      item.status = 'retry-queued';
      schedulerState.queue.unshift(packet);
      schedulerLog('retry-queued', packet, { attempts: item.attempts });
    } else {
      item.status = 'failed';
      schedulerLog('failed', packet, { reason: 'retry limit reached' });
    }
  } else {
    schedulerLog('notify-ignored', packet, { parsed });
  }

  renderScheduler();
}

async function schedulerApplyNotifyFromUi() {
  const parsedResponse = await parseNotifyHex($('#notifyHex').value, $('#notifyParser').value);
  $('#notifyOutput').textContent = JSON.stringify(parsedResponse.result, null, 2);
  schedulerApplyParsed(parsedResponse.result);
}

function schedulerTick() {
  if (!schedulerState) throw new Error('Load scheduler first.');
  schedulerState.clock += schedulerState.timeoutMs;

  for (const item of schedulerState.frames) {
    if (item.status !== 'sent') continue;
    const elapsed = schedulerState.clock - (item.lastSentAt || 0);
    if (elapsed < schedulerState.timeoutMs) continue;

    schedulerLog('timeout', item.packet, { elapsed, attempt: item.attempts });
    if (item.attempts <= schedulerState.retryLimit) {
      item.status = 'retry-queued';
      schedulerState.queue.push(item.packet);
      schedulerLog('retry-queued', item.packet, { attempts: item.attempts });
    } else {
      item.status = 'failed';
      schedulerLog('failed', item.packet, { reason: 'timeout retry limit reached' });
    }
  }

  renderScheduler();
}

function schedulerExport() {
  if (!schedulerState) throw new Error('Load scheduler first.');
  downloadText('mcard-retry-scheduler-log.json', JSON.stringify({
    schema: 'mcard-starterkit.retry-scheduler-log.v1',
    createdAt: new Date().toISOString(),
    scheduler: schedulerSnapshot()
  }, null, 2));
}

async function parseNotifyHex(hex, parserId = $('#notifyParser')?.value || 'auto') {
  return await getJson('/api/notify/parse', {
    method: 'POST',
    body: JSON.stringify({ parserId, hex })
  });
}

async function parseNotifyFromUi() {
  const data = await parseNotifyHex($('#notifyHex').value, $('#notifyParser').value);
  $('#notifyOutput').textContent = JSON.stringify(data.result, null, 2);
}

function loadNotifySample() {
  $('#notifyHex').value = $('#notifySample').value;
}


function addBleLog(entry) {
  bleLog.push({
    t: new Date().toISOString(),
    ...entry
  });
  if (bleLog.length > 5000) bleLog = bleLog.slice(-5000);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
}

function downloadDataUrl(filename, dataUrl) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function hexToBytes(hex) {
  const compact = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
  if (!compact || compact.length % 2 !== 0) {
    throw new Error('Frame hex must contain an even number of hex digits.');
  }
  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) {
    bytes[i / 2] = parseInt(compact.slice(i, i + 2), 16);
  }
  return bytes;
}

function bleOutput(message, append = false) {
  const target = $('#bleOutput');
  if (!target) return;
  target.textContent = append && target.textContent
    ? `${target.textContent}\n${message}`
    : message;
}

function assertBleConsent() {
  if (!$('#bleConsentOwnDevice')?.checked || !$('#bleConsentNoFirmware')?.checked) {
    throw new Error('Enable both safety checkboxes before using Web Bluetooth transport.');
  }
}

function checkBluetoothTransport() {
  const supported = !!navigator.bluetooth;
  const secure = window.isSecureContext;
  bleOutput(JSON.stringify({
    webBluetoothSupported: supported,
    secureContext: secure,
    defaultWritesEnabled: false,
    note: supported && secure
      ? 'Ready for explicit user-initiated connection.'
      : 'Use Chrome/Edge on HTTPS or localhost with Web Bluetooth support.'
  }, null, 2));
}

async function connectBluetoothTransport() {
  assertBleConsent();

  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not available in this browser.');
  }
  if (!window.isSecureContext) {
    throw new Error('Web Bluetooth requires a secure context. Use localhost or HTTPS.');
  }

  const serviceUuid = $('#bleServiceUuid').value.trim();
  const writeCharUuid = $('#bleWriteCharUuid').value.trim();
  const notifyCharUuid = $('#bleNotifyCharUuid').value.trim();

  bleOutput('Requesting Bluetooth device…');
  bleDevice = await navigator.bluetooth.requestDevice({
    filters: [{ services: [serviceUuid] }],
    optionalServices: [serviceUuid]
  });

  bleDevice.addEventListener('gattserverdisconnected', () => {
    bleServer = null;
    bleWriteCharacteristic = null;
    bleOutput('Disconnected.', true);
  });

  bleOutput(`Connecting to ${bleDevice.name || 'unnamed device'}…`, true);
  bleServer = await bleDevice.gatt.connect();

  const service = await bleServer.getPrimaryService(serviceUuid);
  bleWriteCharacteristic = await service.getCharacteristic(writeCharUuid);

  bleOutput(JSON.stringify({
    connected: true,
    deviceName: bleDevice.name || null,
    serviceUuid,
    writeCharUuid,
    notifyCharUuid,
    canWrite: !!bleWriteCharacteristic.writeValue,
    canWriteWithoutResponse: !!bleWriteCharacteristic.writeValueWithoutResponse
  }, null, 2));
}

function disconnectBluetoothTransport() {
  if (bleDevice?.gatt?.connected) {
    bleDevice.gatt.disconnect();
  }
  bleDevice = null;
  bleServer = null;
  bleWriteCharacteristic = null;
  bleNotifyCharacteristic = null;
  bleOutput('Disconnected.');
}

function useFirstGeneratedFrame() {
  if (!latestFilePlan?.frames?.length) {
    throw new Error('Build FILE frames first.');
  }
  $('#bleFrameHex').value = latestFilePlan.frames[0].frameHex;
  bleOutput(`Loaded first generated frame (${latestFilePlan.frames[0].frameLength || latestFilePlan.frames[0].frameHex.length / 2} bytes).`);
}

async function writeFrameHex(hex, label = 'frame') {
  assertBleConsent();

  if (!bleWriteCharacteristic) {
    throw new Error('Connect to a device first.');
  }

  const bytes = hexToBytes(hex);
  if (bytes.length > 512) {
    // Not a protocol limit. This is a UI guardrail to avoid accidental huge writes.
    // Downstream transport can split further if needed.
    bleOutput(`Warning: ${label} is ${bytes.length} bytes. Browser/device may reject large GATT writes.`, true);
  }

  if (bleWriteCharacteristic.writeValueWithoutResponse) {
    await bleWriteCharacteristic.writeValueWithoutResponse(bytes);
  } else {
    await bleWriteCharacteristic.writeValue(bytes);
  }

  addBleLog({ type: 'write', label, bytes: bytes.length, hex: bytesToHex(bytes) });
  bleOutput(`Wrote ${label}: ${bytes.length} bytes`, true);
}

async function writeSingleBleFrame() {
  await writeFrameHex($('#bleFrameHex').value, 'single frame');
}

async function writeAllGeneratedFrames() {
  assertBleConsent();

  if (!latestFilePlan?.frames?.length) {
    throw new Error('Build FILE frames first.');
  }
  if (!bleWriteCharacteristic) {
    throw new Error('Connect to a device first.');
  }

  bleOutput(`Writing ${latestFilePlan.frames.length} generated frame(s)…`);
  for (const frame of latestFilePlan.frames) {
    await writeFrameHex(frame.frameHex, `packet ${frame.index}`);
    // Gentle pacing so browser and device queues do not get bonked by a packet goblin.
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  bleOutput('All generated frames submitted.', true);
}


async function subscribeBluetoothNotifications() {
  assertBleConsent();

  if (!bleServer?.connected) {
    throw new Error('Connect to a device first.');
  }

  const serviceUuid = $('#bleServiceUuid').value.trim();
  const notifyCharUuid = $('#bleNotifyCharUuid').value.trim();

  const service = await bleServer.getPrimaryService(serviceUuid);
  bleNotifyCharacteristic = await service.getCharacteristic(notifyCharUuid);

  bleNotifyCharacteristic.addEventListener('characteristicvaluechanged', async (event) => {
    const value = event.target.value;
    const bytes = new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    const hex = bytesToHex(bytes);
    let parsed = null;
    try {
      const parsedResponse = await parseNotifyHex(hex, $('#notifyParser')?.value || 'auto');
      parsed = parsedResponse.result;
    } catch (err) {
      parsed = { type: 'unknown', message: err.message };
    }
    addBleLog({ type: 'notify', bytes: bytes.length, hex, parsed });
    if (schedulerState && parsed?.matched) schedulerApplyParsed(parsed);
    bleOutput(`NOTIFY ${bytes.length} bytes: ${hex}\nPARSED ${JSON.stringify(parsed)}`, true);
  });

  await bleNotifyCharacteristic.startNotifications();
  bleOutput(`Subscribed to notifications on ${notifyCharUuid}.`, true);
}

function clearBleLog() {
  bleLog = [];
  bleOutput('BLE log cleared.');
}

function exportBleLog() {
  downloadText('mcard-ble-transfer-log.json', JSON.stringify({
    schema: 'mcard-starterkit.ble-log.v1',
    createdAt: new Date().toISOString(),
    entries: bleLog
  }, null, 2));
}

async function simulateAckRetry() {
  const pkg = JSON.parse($('#packageJson').value);
  const data = await getJson('/api/file/simulate-ack-retry', {
    method: 'POST',
    body: JSON.stringify({
      package: pkg,
      mtu: Number($('#mtu').value || 247),
      filename: `${pkg.name || 'badge-media'}.mcpkg`,
      simulation: {
        lossEvery: Number($('#ackLossEvery').value || 0),
        retryLimit: Number($('#ackRetryLimit').value || 2),
        ackDelayMs: Number($('#ackDelayMs').value || 30),
        timeoutMs: Number($('#ackTimeoutMs').value || 300)
      }
    })
  });
  latestFilePlan = data.plan;
  $('#ackOutput').textContent = JSON.stringify({
    summary: {
      ok: data.ackSimulation.ok,
      totalPackets: data.ackSimulation.totalPackets,
      retryCount: data.ackSimulation.retryCount,
      failed: data.ackSimulation.failed,
      virtualDurationMs: data.ackSimulation.virtualDurationMs
    },
    firstEvents: data.ackSimulation.log.slice(0, 20)
  }, null, 2);
}


function checkBluetooth() {
  const supported = !!navigator.bluetooth;
  $('#bluetoothOutput').textContent = JSON.stringify({
    webBluetoothSupported: supported,
    defaultWritesEnabled: false,
    note: supported
      ? 'Browser supports Web Bluetooth. Transport code is intentionally not implemented by default.'
      : 'This browser does not expose navigator.bluetooth.'
  }, null, 2);
}

async function loadDocs() {
  const data = await getJson('/api/docs');
  $('#docs').innerHTML = data.docs.map((doc) => `<a href="/${doc.path}" target="_blank">${doc.title}</a>`).join('');
}

$('#loadSample').addEventListener('click', loadSample);
$('#buildFrames').addEventListener('click', buildFrames);
$('#simulateTransfer').addEventListener('click', simulateTransfer);
$('#checkBluetooth').addEventListener('click', checkBluetooth);
$('#loadDocs').addEventListener('click', loadDocs);

loadSample();


if ($('#bleCheck')) {
  $('#bleCheck').addEventListener('click', () => {
    try { checkBluetoothTransport(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleConnect').addEventListener('click', async () => {
    try { await connectBluetoothTransport(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleDisconnect').addEventListener('click', () => {
    try { disconnectBluetoothTransport(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleUseFirstFrame').addEventListener('click', () => {
    try { useFirstGeneratedFrame(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleWriteFrame').addEventListener('click', async () => {
    try { await writeSingleBleFrame(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleWriteAllFrames').addEventListener('click', async () => {
    try { await writeAllGeneratedFrames(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
}


if ($('#bleSubscribe')) {
  $('#bleSubscribe').addEventListener('click', async () => {
    try { await subscribeBluetoothNotifications(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleClearLog').addEventListener('click', () => {
    try { clearBleLog(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
  $('#bleExportLog').addEventListener('click', () => {
    try { exportBleLog(); } catch (err) { bleOutput(`Error: ${err.message}`); }
  });
}
if ($('#simulateAckRetry')) {
  $('#simulateAckRetry').addEventListener('click', async () => {
    try { await simulateAckRetry(); } catch (err) { $('#ackOutput').textContent = `Error: ${err.message}`; }
  });
}

if ($('#notifyParse')) {
  $('#notifyParse').addEventListener('click', async () => {
    try { await parseNotifyFromUi(); } catch (err) { $('#notifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#notifyLoadSample').addEventListener('click', loadNotifySample);
}

if ($('#schedulerLoadFromFrames')) {
  $('#schedulerLoadFromFrames').addEventListener('click', () => {
    try { loadSchedulerFromFrames(); } catch (err) { $('#schedulerOutput').textContent = `Error: ${err.message}`; }
  });
  $('#schedulerSendNext').addEventListener('click', () => {
    try { schedulerSendNext(); } catch (err) { $('#schedulerOutput').textContent = `Error: ${err.message}`; }
  });
  $('#schedulerApplyNotify').addEventListener('click', async () => {
    try { await schedulerApplyNotifyFromUi(); } catch (err) { $('#schedulerOutput').textContent = `Error: ${err.message}`; }
  });
  $('#schedulerTick').addEventListener('click', () => {
    try { schedulerTick(); } catch (err) { $('#schedulerOutput').textContent = `Error: ${err.message}`; }
  });
  $('#schedulerExport').addEventListener('click', () => {
    try { schedulerExport(); } catch (err) { $('#schedulerOutput').textContent = `Error: ${err.message}`; }
  });
}


let activeProfile = null;
let mediaImage = null;
let latestPngDataUrl = null;
let latestAnimationManifest = null;
let animTimer = null;
let animIndex = 0;
let latestMediaPackage = null;

function safeJsonParse(text, fallback = null) {
  try { return JSON.parse(text); } catch { return fallback; }
}

async function loadProfileList() {
  const data = await getJson('/api/profiles');
  $('#profileSelect').innerHTML = data.profiles.map((profile) =>
    `<option value="${profile.path}">${profile.title}</option>`
  ).join('');
  $('#profileOutput').textContent = JSON.stringify(data.profiles, null, 2);
}

async function loadSelectedProfile() {
  const path = $('#profileSelect').value || 'examples/profiles/monicard-like.sample.json';
  const data = await getJson(`/api/profile?path=${encodeURIComponent(path)}`);
  activeProfile = data.profile;
  $('#activeProfileId').value = activeProfile.id || '';
  $('#profileEditor').value = JSON.stringify(activeProfile, null, 2);
  $('#profileOutput').textContent = 'Profile loaded.';
  persistWorkspaceQuietly();
}

function validateProfileEditor() {
  const profile = safeJsonParse($('#profileEditor').value);
  const errors = [];
  if (!profile) errors.push('Profile JSON is invalid.');
  if (profile && !profile.schema) errors.push('Missing schema.');
  if (profile && !profile.id) errors.push('Missing id.');
  if (profile && !profile.categories) errors.push('Missing categories.');
  if (profile && !Array.isArray(profile.notifyParsers)) errors.push('notifyParsers should be an array.');
  if (!errors.length) activeProfile = profile;
  $('#profileOutput').textContent = JSON.stringify({
    ok: errors.length === 0,
    errors,
    id: profile?.id || null,
    notifyParsers: profile?.notifyParsers || []
  }, null, 2);
  persistWorkspaceQuietly();
}

function useProfileParserList() {
  const profile = safeJsonParse($('#profileEditor').value, activeProfile);
  if (!profile?.notifyParsers?.length) {
    $('#profileOutput').textContent = 'Profile has no notifyParsers.';
    return;
  }
  const first = profile.notifyParsers[0];
  if ($('#notifyParser')) $('#notifyParser').value = first;
  $('#profileOutput').textContent = `Active notify parser set to ${first}`;
}

function drawImageToFixedCanvas(image, canvas, fitMode, bg) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg || '#11131a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!image) {
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.font = '700 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('240×320', 120, 150);
    ctx.font = '500 12px system-ui';
    ctx.fillText('local canvas', 120, 174);
    return;
  }

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  let dw = cw;
  let dh = ch;

  if (fitMode !== 'stretch') {
    const scale = fitMode === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
    dw = iw * scale;
    dh = ih * scale;
  }

  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, dx, dy, dw, dh);
}

function redrawMediaCanvas() {
  const canvas = $('#mediaCanvas');
  drawImageToFixedCanvas(mediaImage, canvas, $('#mediaFitMode')?.value || 'cover', $('#mediaBg')?.value || '#11131a');
  latestPngDataUrl = canvas.toDataURL('image/png');
  $('#mediaOutput').textContent = JSON.stringify({
    output: '240x320 PNG',
    sourceLoaded: !!mediaImage,
    bytesApprox: Math.round((latestPngDataUrl.length - 'data:image/png;base64,'.length) * 0.75)
  }, null, 2);
  persistWorkspaceQuietly();
}

async function loadMediaImage(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    mediaImage = image;
    $('#mediaFileName').value = file.name.replace(/\.[^.]+$/, '') + '.png';
    redrawMediaCanvas();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    $('#mediaOutput').textContent = 'Failed to load image.';
  };
  image.src = url;
}

function exportPng() {
  redrawMediaCanvas();
  downloadDataUrl($('#mediaFileName').value || 'badge-image.png', latestPngDataUrl);
}

function useMediaAsPackage() {
  redrawMediaCanvas();
  $('#pkgType').value = 'image';
  $('#pkgSource').value = latestPngDataUrl;
  $('#pkgOutput').textContent = 'Media Studio PNG copied to package source.';
  persistWorkspaceQuietly();
}

function imageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load ${file.name}`));
    };
    image.src = url;
  });
}

async function buildAnimation() {
  const files = Array.from($('#animFiles')?.files || []);
  if (!files.length) {
    $('#animOutput').textContent = 'Choose image files first.';
    return;
  }

  const durationMs = Number($('#animDuration').value || 120);
  const fitMode = $('#animFitMode').value || 'cover';
  const bg = $('#animBg').value || '#11131a';
  const canvas = $('#animCanvas');
  const frames = [];

  for (const [index, file] of files.entries()) {
    const image = await imageFromFile(file);
    drawImageToFixedCanvas(image, canvas, fitMode, bg);
    const dataUrl = canvas.toDataURL('image/png');
    frames.push({
      index,
      sourceName: file.name,
      durationMs,
      width: 240,
      height: 320,
      mime: 'image/png',
      approxBytes: Math.round((dataUrl.length - 'data:image/png;base64,'.length) * 0.75),
      dataUrl
    });
  }

  latestAnimationManifest = {
    schema: 'mcard-starterkit.animation.v1',
    width: 240,
    height: 320,
    frameCount: frames.length,
    totalDurationMs: frames.reduce((sum, frame) => sum + frame.durationMs, 0),
    frames
  };
  animIndex = 0;
  drawAnimationPreview();
  $('#animOutput').textContent = JSON.stringify({
    frameCount: latestAnimationManifest.frameCount,
    totalDurationMs: latestAnimationManifest.totalDurationMs,
    totalApproxBytes: frames.reduce((sum, frame) => sum + frame.approxBytes, 0)
  }, null, 2);
  persistWorkspaceQuietly();
}

function drawAnimationPreview() {
  const canvas = $('#animCanvas');
  if (!latestAnimationManifest?.frames?.length) {
    drawImageToFixedCanvas(null, canvas, 'cover', '#11131a');
    return;
  }
  const frame = latestAnimationManifest.frames[animIndex % latestAnimationManifest.frames.length];
  const image = new Image();
  image.onload = () => canvas.getContext('2d').drawImage(image, 0, 0, 240, 320);
  image.src = frame.dataUrl;
}

function playAnimationPreview() {
  stopAnimationPreview();
  if (!latestAnimationManifest?.frames?.length) return;
  const tick = () => {
    drawAnimationPreview();
    const frame = latestAnimationManifest.frames[animIndex % latestAnimationManifest.frames.length];
    animIndex += 1;
    animTimer = setTimeout(tick, Math.max(20, frame.durationMs));
  };
  tick();
}

function stopAnimationPreview() {
  if (animTimer) clearTimeout(animTimer);
  animTimer = null;
}

function useAnimationAsPackage() {
  if (!latestAnimationManifest) {
    $('#animOutput').textContent = 'Build animation first.';
    return;
  }
  $('#pkgType').value = 'animation';
  $('#pkgSource').value = JSON.stringify(latestAnimationManifest, null, 2);
  $('#pkgOutput').textContent = 'Animation manifest copied to package source.';
  persistWorkspaceQuietly();
}

function buildMediaPackageFromUi() {
  const name = $('#pkgName').value || 'badge-media';
  const type = $('#pkgType').value;
  const source = $('#pkgSource').value;
  let pkg;
  if (type === 'animation') {
    const animation = safeJsonParse(source);
    if (!animation) throw new Error('Animation source JSON is invalid.');
    pkg = {
      schema: 'mcard-starterkit.media-package.v1',
      name,
      type: 'animation',
      target: { width: 240, height: 320 },
      animation,
      stats: {
        frameCount: animation.frames?.length || 0,
        totalDurationMs: animation.totalDurationMs || 0
      }
    };
  } else {
    if (!source.startsWith('data:image/png;base64,')) throw new Error('Static source must be a PNG data URL.');
    pkg = {
      schema: 'mcard-starterkit.media-package.v1',
      name,
      type: 'image',
      target: { width: 240, height: 320 },
      image: { dataUrl: source },
      stats: { approxBytes: Math.round((source.length - 'data:image/png;base64,'.length) * 0.75) }
    };
  }
  latestMediaPackage = pkg;
  $('#pkgOutput').textContent = JSON.stringify(pkg, null, 2);
  persistWorkspaceQuietly();
}

function exportMediaPackageUi() {
  if (!latestMediaPackage) buildMediaPackageFromUi();
  downloadText(`${latestMediaPackage.name || 'badge-media'}.mcpkg.json`, JSON.stringify(latestMediaPackage, null, 2));
}

function sendPackageToTransfer() {
  if (!latestMediaPackage) buildMediaPackageFromUi();
  $('#packageJson').value = JSON.stringify(latestMediaPackage, null, 2);
  $('#pkgOutput').textContent = 'Package copied to FILE Transfer Simulator.';
  persistWorkspaceQuietly();
}

function collectWorkspace() {
  return {
    schema: 'mcard-starterkit.workspace.v2',
    createdAt: new Date().toISOString(),
    activeProfile,
    profileEditor: $('#profileEditor')?.value || '',
    packageJson: $('#packageJson')?.value || '',
    pkgName: $('#pkgName')?.value || '',
    pkgType: $('#pkgType')?.value || '',
    pkgSource: $('#pkgSource')?.value || '',
    latestMediaPackage,
    latestAnimationManifest,
    latestFilePlan,
    scheduler: typeof schedulerSnapshot === 'function' ? schedulerSnapshot() : null
  };
}

function applyWorkspace(workspace) {
  if (!workspace || typeof workspace !== 'object') throw new Error('Invalid workspace.');
  activeProfile = workspace.activeProfile || null;
  if ($('#profileEditor')) $('#profileEditor').value = workspace.profileEditor || JSON.stringify(activeProfile || {}, null, 2);
  if ($('#activeProfileId')) $('#activeProfileId').value = activeProfile?.id || '';
  if ($('#packageJson')) $('#packageJson').value = workspace.packageJson || '';
  if ($('#pkgName')) $('#pkgName').value = workspace.pkgName || 'badge-media';
  if ($('#pkgType')) $('#pkgType').value = workspace.pkgType || 'image';
  if ($('#pkgSource')) $('#pkgSource').value = workspace.pkgSource || '';
  latestMediaPackage = workspace.latestMediaPackage || null;
  latestAnimationManifest = workspace.latestAnimationManifest || null;
  latestFilePlan = workspace.latestFilePlan || null;
  $('#workspaceOutput').textContent = 'Workspace applied.';
}

function saveWorkspaceLocal() {
  const workspace = collectWorkspace();
  localStorage.setItem('mcard-starterkit.workspace', JSON.stringify(workspace));
  $('#workspaceOutput').textContent = 'Workspace saved to localStorage.';
}

function persistWorkspaceQuietly() {
  try {
    const workspace = collectWorkspace();
    localStorage.setItem('mcard-starterkit.workspace.autosave', JSON.stringify(workspace));
  } catch {}
}

function loadWorkspaceLocal() {
  const text = localStorage.getItem('mcard-starterkit.workspace') || localStorage.getItem('mcard-starterkit.workspace.autosave');
  if (!text) throw new Error('No local workspace found.');
  applyWorkspace(JSON.parse(text));
}

function exportWorkspace() {
  downloadText('mcard-workspace.json', JSON.stringify(collectWorkspace(), null, 2));
}

function importWorkspaceApply() {
  const workspace = JSON.parse($('#workspaceImport').value);
  applyWorkspace(workspace);
  persistWorkspaceQuietly();
}


if ($('#profileLoadList')) {
  $('#profileLoadList').addEventListener('click', () => loadProfileList().catch((err) => $('#profileOutput').textContent = `Error: ${err.message}`));
  $('#profileLoadSelected').addEventListener('click', () => loadSelectedProfile().catch((err) => $('#profileOutput').textContent = `Error: ${err.message}`));
  $('#profileValidate').addEventListener('click', () => { try { validateProfileEditor(); } catch (err) { $('#profileOutput').textContent = `Error: ${err.message}`; } });
  $('#profileUseForParsers').addEventListener('click', useProfileParserList);
  $('#mediaFile').addEventListener('change', (event) => loadMediaImage(event.target.files?.[0]));
  $('#mediaFitCover').addEventListener('click', () => { $('#mediaFitMode').value = 'cover'; redrawMediaCanvas(); });
  $('#mediaFitContain').addEventListener('click', () => { $('#mediaFitMode').value = 'contain'; redrawMediaCanvas(); });
  $('#mediaExportPng').addEventListener('click', () => { try { exportPng(); } catch (err) { $('#mediaOutput').textContent = `Error: ${err.message}`; } });
  $('#mediaUseAsPackage').addEventListener('click', () => { try { useMediaAsPackage(); } catch (err) { $('#mediaOutput').textContent = `Error: ${err.message}`; } });
  ['mediaFitMode', 'mediaBg'].forEach((id) => $('#' + id).addEventListener('input', redrawMediaCanvas));

  $('#animBuild').addEventListener('click', () => buildAnimation().catch((err) => $('#animOutput').textContent = `Error: ${err.message}`));
  $('#animPlay').addEventListener('click', playAnimationPreview);
  $('#animStop').addEventListener('click', stopAnimationPreview);
  $('#animUseAsPackage').addEventListener('click', () => { try { useAnimationAsPackage(); } catch (err) { $('#animOutput').textContent = `Error: ${err.message}`; } });

  $('#pkgBuild').addEventListener('click', () => { try { buildMediaPackageFromUi(); } catch (err) { $('#pkgOutput').textContent = `Error: ${err.message}`; } });
  $('#pkgExport').addEventListener('click', () => { try { exportMediaPackageUi(); } catch (err) { $('#pkgOutput').textContent = `Error: ${err.message}`; } });
  $('#pkgSendToTransfer').addEventListener('click', () => { try { sendPackageToTransfer(); } catch (err) { $('#pkgOutput').textContent = `Error: ${err.message}`; } });

  $('#workspaceSaveLocal').addEventListener('click', () => { try { saveWorkspaceLocal(); } catch (err) { $('#workspaceOutput').textContent = `Error: ${err.message}`; } });
  $('#workspaceLoadLocal').addEventListener('click', () => { try { loadWorkspaceLocal(); } catch (err) { $('#workspaceOutput').textContent = `Error: ${err.message}`; } });
  $('#workspaceExport').addEventListener('click', () => { try { exportWorkspace(); } catch (err) { $('#workspaceOutput').textContent = `Error: ${err.message}`; } });
  $('#workspaceImportApply').addEventListener('click', () => { try { importWorkspaceApply(); } catch (err) { $('#workspaceOutput').textContent = `Error: ${err.message}`; } });

  drawImageToFixedCanvas(null, $('#mediaCanvas'), 'cover', '#11131a');
  drawImageToFixedCanvas(null, $('#animCanvas'), 'cover', '#11131a');
  loadProfileList().then(loadSelectedProfile).catch(() => {});
}


async function buildProfiledFrames() {
  const pkg = JSON.parse($('#packageJson').value);
  const profile = safeJsonParse($('#profileEditor')?.value || 'null', activeProfile);
  const data = await getJson('/api/file/frames-profiled', {
    method: 'POST',
    body: JSON.stringify({
      package: pkg,
      profile,
      mtu: Number($('#mtu').value || profile?.transfer?.defaultMtu || 247),
      filename: `${pkg.name || 'badge-media'}.mcpkg`
    })
  });
  latestFilePlan = data;
  $('#output').textContent = JSON.stringify({
    profileId: data.profileId,
    totalSize: data.totalSize,
    packetSize: data.packetSize,
    totalPackets: data.totalPackets,
    dataPacketCommandName: data.dataPacketCommandName,
    payloadCrc32Mpeg2: data.payloadCrc32Mpeg2,
    firstFrame: data.frames[0]
  }, null, 2);
  persistWorkspaceQuietly();
}


if ($('#buildProfiledFrames')) {
  $('#buildProfiledFrames').addEventListener('click', () => {
    try { buildProfiledFrames(); } catch (err) { $('#output').textContent = `Error: ${err.message}`; }
  });
}

let latestProfileFrame = null;
let latestOtaPlan = null;

function currentProfileForApi() {
  return safeJsonParse($('#profileEditor')?.value || 'null', activeProfile) || activeProfile || null;
}

async function buildProfileFrameFromUi() {
  const mode = $('#profileFrameInputMode').value;
  const body = {
    profile: currentProfileForApi(),
    group: $('#profileFrameGroup').value,
    commandName: $('#profileFrameCommand').value,
    inputMode: mode,
    text: mode === 'text' ? $('#profileFrameData').value : '',
    hex: mode === 'hex' ? $('#profileFrameData').value : '',
    base64: mode === 'base64' ? $('#profileFrameData').value : '',
    fragmentState: Number($('#profileFrameFragment').value || 0)
  };
  const data = await getJson('/api/frame/build-profiled', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  latestProfileFrame = data.frame;
  $('#profileFrameOutput').textContent = JSON.stringify(data.frame, null, 2);
}

function useProfileFrameForBle() {
  if (!latestProfileFrame?.frameHex) throw new Error('Build a profile frame first.');
  $('#bleFrameHex').value = latestProfileFrame.frameHex;
  $('#profileFrameOutput').textContent = JSON.stringify({
    copiedToBleFrameHex: true,
    frame: latestProfileFrame
  }, null, 2);
}

async function buildProfileOtaPlanFromUi() {
  const mode = $('#profileFrameInputMode').value;
  const body = {
    profile: currentProfileForApi(),
    inputMode: mode,
    text: mode === 'text' ? $('#profileFrameData').value : 'Synthetic OTA frame plan payload',
    hex: mode === 'hex' ? $('#profileFrameData').value : '',
    base64: mode === 'base64' ? $('#profileFrameData').value : '',
    packetSize: 2048
  };
  const data = await getJson('/api/ota/frames-profiled', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  latestOtaPlan = data.plan;
  $('#profileFrameOutput').textContent = JSON.stringify({
    profileId: data.plan.profileId,
    totalSize: data.plan.totalSize,
    totalPackets: data.plan.totalPackets,
    packageCrc32Mpeg2: data.plan.packageCrc32Mpeg2,
    firstFrame: data.plan.frames[0]
  }, null, 2);
}

if ($('#buildProfileFrame')) {
  $('#buildProfileFrame').addEventListener('click', async () => {
    try { await buildProfileFrameFromUi(); } catch (err) { $('#profileFrameOutput').textContent = `Error: ${err.message}`; }
  });
  $('#useProfileFrameForBle').addEventListener('click', () => {
    try { useProfileFrameForBle(); } catch (err) { $('#profileFrameOutput').textContent = `Error: ${err.message}`; }
  });
  $('#buildProfileOtaPlan').addEventListener('click', async () => {
    try { await buildProfileOtaPlanFromUi(); } catch (err) { $('#profileFrameOutput').textContent = `Error: ${err.message}`; }
  });
}

let latestLocalOtaHex = null;
let latestLocalOtaVerification = null;

async function buildLocalOtaFromUi() {
  const mode = $('#otaVerifyInputMode').value;
  const body = {
    imageId: Number($('#otaVerifyImageId').value || 1),
    inputMode: mode === 'hex' ? 'text' : mode,
    text: mode === 'hex' ? 'Synthetic local OTA verifier sample.' : $('#otaVerifyInput').value,
    base64: mode === 'base64' ? $('#otaVerifyInput').value : ''
  };
  const data = await getJson('/api/ota/build-local', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  latestLocalOtaHex = data.hex;
  latestLocalOtaVerification = data.verification;
  $('#otaVerifyInputMode').value = 'hex';
  $('#otaVerifyInput').value = data.hex;
  $('#otaVerifyOutput').textContent = JSON.stringify({
    size: data.size,
    sha256: data.sha256,
    verification: data.verification
  }, null, 2);
}

async function verifyLocalOtaFromUi() {
  const mode = $('#otaVerifyInputMode').value;
  const data = await getJson('/api/ota/verify-local', {
    method: 'POST',
    body: JSON.stringify({
      inputMode: mode,
      hex: mode === 'hex' ? $('#otaVerifyInput').value : '',
      text: mode === 'text' ? $('#otaVerifyInput').value : '',
      base64: mode === 'base64' ? $('#otaVerifyInput').value : ''
    })
  });
  latestLocalOtaVerification = data.verification;
  if (mode === 'hex') latestLocalOtaHex = $('#otaVerifyInput').value;
  $('#otaVerifyOutput').textContent = JSON.stringify(data.verification, null, 2);
}

async function planVerifiedOtaFrames() {
  if (!latestLocalOtaHex) {
    if ($('#otaVerifyInputMode').value !== 'hex') throw new Error('Build or paste a hex MCOT package first.');
    latestLocalOtaHex = $('#otaVerifyInput').value;
  }
  const data = await getJson('/api/ota/frames-profiled', {
    method: 'POST',
    body: JSON.stringify({
      profile: currentProfileForApi(),
      inputMode: 'hex',
      hex: latestLocalOtaHex,
      packetSize: 2048
    })
  });
  latestOtaPlan = data.plan;
  $('#otaVerifyOutput').textContent = JSON.stringify({
    verification: latestLocalOtaVerification,
    otaPlan: {
      profileId: data.plan.profileId,
      totalSize: data.plan.totalSize,
      totalPackets: data.plan.totalPackets,
      packageCrc32Mpeg2: data.plan.packageCrc32Mpeg2,
      firstFrame: data.plan.frames[0]
    }
  }, null, 2);
}

async function parseControlResponseFromUi() {
  const data = await getJson('/api/control/parse-response', {
    method: 'POST',
    body: JSON.stringify({
      profile: currentProfileForApi(),
      hex: $('#controlResponseHex').value
    })
  });
  $('#controlResponseOutput').textContent = JSON.stringify(data.result, null, 2);
}

if ($('#otaBuildLocal')) {
  $('#otaBuildLocal').addEventListener('click', async () => {
    try { await buildLocalOtaFromUi(); } catch (err) { $('#otaVerifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#otaVerifyLocal').addEventListener('click', async () => {
    try { await verifyLocalOtaFromUi(); } catch (err) { $('#otaVerifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#otaPlanVerified').addEventListener('click', async () => {
    try { await planVerifiedOtaFrames(); } catch (err) { $('#otaVerifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#controlSampleVersion').addEventListener('click', () => {
    $('#controlResponseHex').value = '1f 00 07 00 15 00 30 2e 31 2e 30';
  });
  $('#controlSampleBattery').addEventListener('click', () => {
    $('#controlResponseHex').value = '1f 00 04 00 17 00 57 00';
  });
  $('#controlParseResponse').addEventListener('click', async () => {
    try { await parseControlResponseFromUi(); } catch (err) { $('#controlResponseOutput').textContent = `Error: ${err.message}`; }
  });
}

async function parseMappedResponseFromUi() {
  const data = await getJson('/api/response/parse', {
    method: 'POST',
    body: JSON.stringify({
      profile: currentProfileForApi(),
      group: $('#mappedResponseGroup').value,
      hex: $('#mappedResponseHex').value
    })
  });
  $('#mappedResponseOutput').textContent = JSON.stringify(data.result, null, 2);
  if (schedulerState && data.result?.matched) {
    schedulerApplyParsed({
      ...data.result,
      packetIndex: data.result.value?.packetIndex ?? data.result.packetIndex,
      status: data.result.status ?? data.result.value?.status
    });
  }
}

function loadMappedResponseSample() {
  $('#mappedResponseHex').value = $('#mappedResponseSample').value;
  const sample = $('#mappedResponseSample').value.trim();
  $('#mappedResponseGroup').value = sample.startsWith('01') ? 'ota' : 'file';
}

function collectCombinedLog() {
  return {
    schema: 'mcard-starterkit.combined-log.v1',
    createdAt: new Date().toISOString(),
    bleLog: typeof bleLog !== 'undefined' ? bleLog : [],
    scheduler: typeof schedulerSnapshot === 'function' ? schedulerSnapshot() : null,
    latestFilePlanSummary: latestFilePlan ? {
      profileId: latestFilePlan.profileId,
      totalPackets: latestFilePlan.totalPackets,
      totalSize: latestFilePlan.totalSize,
      packetSize: latestFilePlan.packetSize
    } : null,
    latestOtaPlanSummary: latestOtaPlan ? {
      profileId: latestOtaPlan.profileId,
      totalPackets: latestOtaPlan.totalPackets,
      totalSize: latestOtaPlan.totalSize,
      packetSize: latestOtaPlan.packetSize
    } : null
  };
}

function refreshTransferLogViewer() {
  const filter = ($('#transferLogFilter').value || '').toLowerCase();
  const max = Number($('#transferLogMax').value || 100);
  const combined = collectCombinedLog();
  let entries = [];

  if (combined.bleLog) entries.push(...combined.bleLog.map((entry) => ({ source: 'ble', ...entry })));
  if (combined.scheduler?.events) entries.push(...combined.scheduler.events.map((entry) => ({ source: 'scheduler', ...entry })));

  if (filter) {
    entries = entries.filter((entry) => JSON.stringify(entry).toLowerCase().includes(filter));
  }

  entries = entries.slice(-max);
  $('#transferLogOutput').textContent = JSON.stringify({
    count: entries.length,
    entries
  }, null, 2);
}

function exportTransferLogViewer() {
  downloadText('mcard-combined-transfer-log.json', JSON.stringify(collectCombinedLog(), null, 2));
}

function clearTransferLogViewer() {
  if (typeof bleLog !== 'undefined') bleLog = [];
  if (schedulerState) schedulerState.events = [];
  $('#transferLogOutput').textContent = 'View logs cleared.';
}

function bytesToHexLocal(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
}

async function loadOtaLocalFileAsHex() {
  const file = $('#otaVerifyFile')?.files?.[0];
  if (!file) throw new Error('Choose a local package file first.');
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  $('#otaVerifyInputMode').value = 'hex';
  $('#otaVerifyInput').value = bytesToHexLocal(bytes);
  $('#otaVerifyOutput').textContent = `Loaded ${file.name}: ${bytes.length} bytes as hex.`;
}

function estimateCurrentPackageSize() {
  const pkg = JSON.parse($('#packageJson').value || '{}');
  let payloadBytes = 0;
  let frames = latestFilePlan?.frames || [];
  if (pkg.image?.dataUrl) {
    payloadBytes = Math.round((pkg.image.dataUrl.length - 'data:image/png;base64,'.length) * 0.75);
  } else if (pkg.animation?.frames) {
    payloadBytes = pkg.animation.frames.reduce((sum, frame) => {
      return sum + Math.round(((frame.dataUrl || '').length - 'data:image/png;base64,'.length) * 0.75);
    }, 0);
  }
  const totalFrameBytes = frames.reduce((sum, frame) => sum + (frame.frameLength || Math.ceil((frame.frameHex || '').length / 2)), 0);
  $('#sizeEstimatorOutput').textContent = JSON.stringify({
    packageType: pkg.type || null,
    payloadBytesApprox: payloadBytes,
    generatedFrames: frames.length,
    totalFrameBytesApprox: totalFrameBytes,
    warning: payloadBytes > 1024 * 1024 ? 'Large package. Check device storage and transfer time.' : null
  }, null, 2);
}

if ($('#mappedResponseParse')) {
  $('#mappedResponseLoadSample').addEventListener('click', loadMappedResponseSample);
  $('#mappedResponseParse').addEventListener('click', async () => {
    try { await parseMappedResponseFromUi(); } catch (err) { $('#mappedResponseOutput').textContent = `Error: ${err.message}`; }
  });
  $('#transferLogRefresh').addEventListener('click', () => {
    try { refreshTransferLogViewer(); } catch (err) { $('#transferLogOutput').textContent = `Error: ${err.message}`; }
  });
  $('#transferLogExport').addEventListener('click', () => {
    try { exportTransferLogViewer(); } catch (err) { $('#transferLogOutput').textContent = `Error: ${err.message}`; }
  });
  $('#transferLogClear').addEventListener('click', () => {
    try { clearTransferLogViewer(); } catch (err) { $('#transferLogOutput').textContent = `Error: ${err.message}`; }
  });
  $('#otaLoadLocalFile').addEventListener('click', async () => {
    try { await loadOtaLocalFileAsHex(); } catch (err) { $('#otaVerifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#estimatePackageSize').addEventListener('click', () => {
    try { estimateCurrentPackageSize(); } catch (err) { $('#sizeEstimatorOutput').textContent = `Error: ${err.message}`; }
  });
}

let latestEmulatorNotify = null;

async function simulateEmulatorNotifyFromUi() {
  const data = await getJson('/api/emulator/notify', {
    method: 'POST',
    body: JSON.stringify({
      profile: currentProfileForApi(),
      hex: $('#emulatorFrameHex').value
    })
  });
  latestEmulatorNotify = data.result;
  $('#emulatorNotifyOutput').textContent = JSON.stringify(data.result, null, 2);
}

function useBleFrameForEmulator() {
  $('#emulatorFrameHex').value = $('#bleFrameHex')?.value || '';
}

async function applyEmulatorNotifyToParsers() {
  if (!latestEmulatorNotify?.notifications?.length) throw new Error('Simulate notify first.');
  const notify = latestEmulatorNotify.notifications[0];
  if ($('#notifyHex')) $('#notifyHex').value = notify.hex;
  if ($('#mappedResponseHex')) $('#mappedResponseHex').value = notify.hex;

  const category = notify.hex.trim().toLowerCase().startsWith('01') ? 'ota' : notify.hex.trim().toLowerCase().startsWith('04') ? 'file' : 'control';
  if (category === 'control') {
    await parseControlResponseFromUi();
  } else {
    if ($('#mappedResponseGroup')) $('#mappedResponseGroup').value = category;
    await parseMappedResponseFromUi();
  }
}

async function migrateWorkspaceFromUi() {
  const raw = JSON.parse($('#workspaceImport').value || '{}');
  const data = await getJson('/api/workspace/migrate', {
    method: 'POST',
    body: JSON.stringify({ workspace: raw })
  });
  $('#workspaceImport').value = JSON.stringify(data.workspace, null, 2);
  $('#workspaceOutput').textContent = JSON.stringify(data.workspace.validation, null, 2);
}

if ($('#emulatorSimulateNotify')) {
  $('#emulatorUseBleFrame').addEventListener('click', () => {
    try { useBleFrameForEmulator(); } catch (err) { $('#emulatorNotifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#emulatorSimulateNotify').addEventListener('click', async () => {
    try { await simulateEmulatorNotifyFromUi(); } catch (err) { $('#emulatorNotifyOutput').textContent = `Error: ${err.message}`; }
  });
  $('#emulatorApplyToParsers').addEventListener('click', async () => {
    try { await applyEmulatorNotifyToParsers(); } catch (err) { $('#emulatorNotifyOutput').textContent = `Error: ${err.message}`; }
  });
}

if ($('#workspaceMigrate')) {
  $('#workspaceMigrate').addEventListener('click', async () => {
    try { await migrateWorkspaceFromUi(); } catch (err) { $('#workspaceOutput').textContent = `Error: ${err.message}`; }
  });
}

let latestNativeMediaAnimation = null;
let latestNormalizedTransportLog = null;

async function decodeImageFileNative(file, maxFrames = 60, minDurationMs = 80) {
  const mime = file.type || 'application/octet-stream';
  const buffer = await file.arrayBuffer();
  const frames = [];

  if ('ImageDecoder' in window) {
    const decoder = new ImageDecoder({ data: buffer, type: mime });
    await decoder.tracks.ready;
    const selectedTrack = decoder.tracks.selectedTrack;
    const frameCount = Math.min(selectedTrack?.frameCount || 1, maxFrames);
    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#11131a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(result.image, 0, 0, canvas.width, canvas.height);
      frames.push({
        index: i,
        durationMs: Math.max(minDurationMs, Math.round((result.image.duration || minDurationMs * 1000) / 1000)),
        width: 240,
        height: 320,
        mime: 'image/png',
        sourceMime: mime,
        dataUrl: canvas.toDataURL('image/png')
      });
      result.image.close?.();
    }
    decoder.close?.();
    return { path: 'ImageDecoder', frames };
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#11131a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  frames.push({
    index: 0,
    durationMs: minDurationMs,
    width: 240,
    height: 320,
    mime: 'image/png',
    sourceMime: mime,
    dataUrl: canvas.toDataURL('image/png')
  });
  return { path: 'createImageBitmap-fallback', frames, warning: 'fallback decodes a poster/static frame only' };
}

async function importNativeMediaFromUi() {
  const file = $('#nativeMediaFile')?.files?.[0];
  if (!file) throw new Error('Choose GIF/APNG/WebP/image file first.');
  const maxFrames = Number($('#nativeMediaMaxFrames').value || 60);
  const minDurationMs = Number($('#nativeMediaMinDuration').value || 80);
  const decoded = await decodeImageFileNative(file, maxFrames, minDurationMs);
  latestNativeMediaAnimation = {
    schema: 'mcard-starterkit.animation.v1',
    sourceName: file.name,
    sourceMime: file.type,
    decoderPath: decoded.path,
    width: 240,
    height: 320,
    frameCount: decoded.frames.length,
    totalDurationMs: decoded.frames.reduce((sum, frame) => sum + frame.durationMs, 0),
    frames: decoded.frames
  };
  $('#nativeMediaOutput').textContent = JSON.stringify({
    decoderPath: decoded.path,
    warning: decoded.warning || null,
    frameCount: latestNativeMediaAnimation.frameCount,
    totalDurationMs: latestNativeMediaAnimation.totalDurationMs
  }, null, 2);
}

function useNativeMediaAsAnimationPackageSource() {
  if (!latestNativeMediaAnimation) throw new Error('Import native media first.');
  $('#pkgType').value = 'animation';
  $('#pkgSource').value = JSON.stringify(latestNativeMediaAnimation, null, 2);
  $('#nativeMediaOutput').textContent = 'Native media animation copied to package source.';
}

async function estimateTransferTimeFromUi() {
  const profile = currentProfileForApi();
  const data = await getJson('/api/transfer/estimate', {
    method: 'POST',
    body: JSON.stringify({
      profile,
      plan: latestFilePlan || {
        totalPackets: 0,
        frames: []
      },
      options: {
        mtu: Number($('#mtu')?.value || profile?.transfer?.defaultMtu || 247)
      }
    })
  });
  $('#sizeEstimatorOutput').textContent = JSON.stringify(data.estimate, null, 2);
}

function sampleJsonRules() {
  return {
    schema: 'mcard-starterkit.json-rule-parser.v1',
    id: 'ui-sample.rules',
    rules: [{
      id: 'file-data-response',
      when: { category: 4, commandAt4: 9 },
      type: 'ack',
      commandName: 'FILE_SEND_DATA_RESPONSE',
      statusField: { offset: 8, type: 'u16le' },
      packetIndexField: { offset: 10, type: 'u32le' },
      message: 'FILE data response matched by JSON rule.'
    }]
  };
}

async function parseJsonRuleFromUi() {
  const ruleset = JSON.parse($('#jsonRuleText').value || '{}');
  const data = await getJson('/api/json-rules/parse', {
    method: 'POST',
    body: JSON.stringify({ ruleset, hex: $('#jsonRuleHex').value })
  });
  $('#jsonRuleOutput').textContent = JSON.stringify(data.result, null, 2);
}

function loadSampleJsonRules() {
  $('#jsonRuleText').value = JSON.stringify(sampleJsonRules(), null, 2);
}

function exportJsonRules() {
  const ruleset = JSON.parse($('#jsonRuleText').value || '{}');
  downloadText(`${ruleset.id || 'parser-rules'}.json`, JSON.stringify(ruleset, null, 2));
}

async function normalizeTransportLogFromUi() {
  const adapter = $('#transportAdapterType').value;
  const input = $('#transportAdapterInput').value;
  let body;
  if (adapter === 'web-bluetooth') {
    body = { adapter, log: JSON.parse(input || '[]') };
  } else {
    body = { adapter, text: input };
  }
  const data = await getJson('/api/transport/adapt-log', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  latestNormalizedTransportLog = data.log;
  $('#transportAdapterOutput').textContent = JSON.stringify(data.log, null, 2);
}

function exportNormalizedTransportLog() {
  if (!latestNormalizedTransportLog) throw new Error('Normalize a log first.');
  downloadText('mcard-normalized-transport-log.json', JSON.stringify(latestNormalizedTransportLog, null, 2));
}

if ($('#nativeMediaImport')) {
  $('#nativeMediaImport').addEventListener('click', async () => {
    try { await importNativeMediaFromUi(); } catch (err) { $('#nativeMediaOutput').textContent = `Error: ${err.message}`; }
  });
  $('#nativeMediaUseAnimation').addEventListener('click', () => {
    try { useNativeMediaAsAnimationPackageSource(); } catch (err) { $('#nativeMediaOutput').textContent = `Error: ${err.message}`; }
  });
  $('#estimateTransferTime').addEventListener('click', async () => {
    try { await estimateTransferTimeFromUi(); } catch (err) { $('#sizeEstimatorOutput').textContent = `Error: ${err.message}`; }
  });
  $('#jsonRuleLoadSample').addEventListener('click', loadSampleJsonRules);
  $('#jsonRuleParse').addEventListener('click', async () => {
    try { await parseJsonRuleFromUi(); } catch (err) { $('#jsonRuleOutput').textContent = `Error: ${err.message}`; }
  });
  $('#jsonRuleExport').addEventListener('click', () => {
    try { exportJsonRules(); } catch (err) { $('#jsonRuleOutput').textContent = `Error: ${err.message}`; }
  });
  $('#transportAdapterNormalize').addEventListener('click', async () => {
    try { await normalizeTransportLogFromUi(); } catch (err) { $('#transportAdapterOutput').textContent = `Error: ${err.message}`; }
  });
  $('#transportAdapterExport').addEventListener('click', () => {
    try { exportNormalizedTransportLog(); } catch (err) { $('#transportAdapterOutput').textContent = `Error: ${err.message}`; }
  });
  loadSampleJsonRules();
}
