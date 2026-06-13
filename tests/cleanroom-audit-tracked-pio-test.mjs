import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mcard-cleanroom-audit-'));

function runAudit() {
  return spawnSync(process.execPath, ['tools/repo-audit/audit-cleanroom.mjs'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
}

try {
  fs.mkdirSync(path.join(fixtureRoot, 'tools/repo-audit'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, '.pio/build/sample'), { recursive: true });
  fs.copyFileSync(
    path.join(root, 'tools/repo-audit/audit-cleanroom.mjs'),
    path.join(fixtureRoot, 'tools/repo-audit/audit-cleanroom.mjs')
  );
  fs.writeFileSync(path.join(fixtureRoot, '.pio/build/sample/firmware.bin'), 'generated');

  execFileSync('git', ['init'], { cwd: fixtureRoot, stdio: 'ignore' });

  const untrackedResult = runAudit();
  assert.equal(
    untrackedResult.status,
    0,
    `untracked .pio output should be ignored:\n${untrackedResult.stderr}`
  );

  execFileSync('git', ['add', '-f', '.pio/build/sample/firmware.bin'], {
    cwd: fixtureRoot,
    stdio: 'ignore',
  });

  const trackedResult = runAudit();
  assert.notEqual(trackedResult.status, 0, 'tracked .pio firmware must fail clean-room audit');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log('clean-room audit tracked .pio test passed');
