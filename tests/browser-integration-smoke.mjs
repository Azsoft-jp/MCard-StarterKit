import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 39129;
const server = spawn('node', ['apps/web/server.js'], {
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

try {
  await wait(900);

  const home = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /MCard-StarterKit/);
  assert.match(html, /Emulator Notify Simulator/);

  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.ok, true);

  const notify = await fetch(`http://127.0.0.1:${port}/api/emulator/notify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ hex: '1f 00 02 00 14 00' })
  });
  assert.equal(notify.status, 200);
  const notifyJson = await notify.json();
  assert.equal(notifyJson.result.ok, true);
  assert.ok(notifyJson.result.notifications[0].hex);

  console.log('browser integration smoke passed');
} finally {
  server.kill();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
