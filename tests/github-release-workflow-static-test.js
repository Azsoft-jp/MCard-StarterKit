const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const workflowPath = path.join(
  root,
  '.github/workflows/hardware-emulator-release.yml'
);
const packagerPath = path.join(root, 'tools/package-hardware-emulator.sh');
const checksumToolPath = path.join(root, 'tools/generate-sha256sums.mjs');

assert.ok(fs.existsSync(workflowPath), 'hardware emulator release workflow missing');
assert.ok(fs.existsSync(packagerPath), 'hardware emulator packager missing');
assert.ok(fs.existsSync(checksumToolPath), 'portable checksum generator missing');
assert.ok(
  fs.statSync(packagerPath).mode & 0o111,
  'hardware emulator packager must be executable'
);

const workflow = fs.readFileSync(workflowPath, 'utf8');
const packager = fs.readFileSync(packagerPath, 'utf8');
const checksumTool = fs.readFileSync(checksumToolPath, 'utf8');

assert.match(workflow, /tags:\s*\n\s+- "v\*"/);
assert.match(workflow, /platformio==6\.1\.19/);
assert.match(workflow, /examples\/esp32-ble-peripheral/);
assert.match(workflow, /environment: esp32dev/);
assert.match(workflow, /examples\/nrf52-ble-peripheral/);
assert.match(workflow, /environment: nrf52840_dk_adafruit/);
assert.match(workflow, /tools\/package-hardware-emulator\.sh/);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.match(workflow, /actions\/download-artifact@v4/);
assert.match(workflow, /gh release upload/);
assert.match(workflow, /SHA256SUMS/);
assert.match(workflow, /contents: write/);
assert.match(workflow, /not vendor firmware/i);
assert.doesNotMatch(workflow, /pull_request:/);
assert.doesNotMatch(workflow, /OTA flashing against real devices/i);

assert.match(packager, /boot_app0\.bin/);
assert.match(packager, /firmware_signature\.bin/);
assert.match(packager, /SHA256SUMS/);
assert.match(packager, /generate-sha256sums\.mjs/);
assert.match(packager, /not vendor firmware/i);
assert.doesNotMatch(packager, /sort -z|\bsha256sum\b/);
assert.match(checksumTool, /createHash\('sha256'\)/);
assert.match(checksumTool, /\.sort\(\)/);

console.log('github release workflow static test passed');
