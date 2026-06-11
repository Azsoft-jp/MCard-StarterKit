const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const examples = [
  'examples/esp32-ble-peripheral',
  'examples/nrf52-ble-peripheral'
];
const requiredFiles = [
  'README.md',
  'platformio.ini',
  'include/mcard_profile.h',
  'src/main.cpp'
];
const serviceUuid = '7a2f0000-2b3c-4d5e-8f90-000000000000';
const writeUuid = '7a2f0002-2b3c-4d5e-8f90-000000000000';
const notifyUuid = '7a2f0003-2b3c-4d5e-8f90-000000000000';

for (const example of examples) {
  for (const file of requiredFiles) {
    const fullPath = path.join(root, example, file);
    assert.ok(fs.existsSync(fullPath), `${example}/${file} missing`);
  }

  const profile = fs.readFileSync(
    path.join(root, example, 'include/mcard_profile.h'),
    'utf8'
  );
  const source = fs.readFileSync(
    path.join(root, example, 'src/main.cpp'),
    'utf8'
  );
  const readme = fs.readFileSync(path.join(root, example, 'README.md'), 'utf8');

  assert.ok(profile.includes(serviceUuid), `${example} service UUID missing`);
  assert.ok(profile.includes(writeUuid), `${example} write UUID missing`);
  assert.ok(profile.includes(notifyUuid), `${example} notify UUID missing`);
  assert.notStrictEqual(writeUuid, notifyUuid, 'write and notify UUIDs must differ');
  assert.match(profile, /MCardKit-Emu/);
  assert.match(source, /printHex\("RX "/);
  assert.match(source, /printHex\("TX "/);
  assert.match(source, /CONTROL_VERSION_RESPONSE/);
  assert.match(source, /FILE_SEND_DATA_RESPONSE/);
  assert.match(source, /OTA_DATA_RESPONSE/);
  assert.match(source, /WARN unknown/);
  assert.match(readme, /public-safe/i);
  assert.match(readme, /explicit/i);
}

const esp32Source = fs.readFileSync(
  path.join(root, examples[0], 'src/main.cpp'),
  'utf8'
);
const nrf52Source = fs.readFileSync(
  path.join(root, examples[1], 'src/main.cpp'),
  'utf8'
);
const esp32Platformio = fs.readFileSync(
  path.join(root, examples[0], 'platformio.ini'),
  'utf8'
);
const nrf52Platformio = fs.readFileSync(
  path.join(root, examples[1], 'platformio.ini'),
  'utf8'
);
assert.match(esp32Platformio, /board\s*=\s*esp32dev/);
assert.match(nrf52Platformio, /board\s*=\s*nrf52840_dk_adafruit/);
assert.match(esp32Source, /PROPERTY_WRITE/);
assert.match(esp32Source, /PROPERTY_NOTIFY/);
assert.match(esp32Source, /notifyCharacteristic->notify\(\)/);
assert.match(nrf52Source, /CHR_PROPS_WRITE/);
assert.match(nrf52Source, /CHR_PROPS_NOTIFY/);
assert.match(nrf52Source, /notifyCharacteristic\.notify/);

const docs = [
  'README.md',
  'docs/TRANSPORT_GUIDE.md',
  'docs/HARDWARE.md',
  'docs-ja/TRANSPORT_GUIDE.md',
  'docs-ja/HARDWARE.md'
].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
assert.match(docs, /hardware BLE emulator/i);
assert.match(docs, /ESP32/);
assert.match(docs, /nRF52/);

const forbiddenExtensions = new Set([
  '.bin',
  '.firmware',
  '.har',
  '.wxapkg',
  '.bsdiff'
]);

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

for (const example of examples) {
  for (const file of walk(path.join(root, example))) {
    assert.ok(
      !forbiddenExtensions.has(path.extname(file).toLowerCase()),
      `forbidden hardware emulator artifact: ${path.relative(root, file)}`
    );
  }
}

assert.ok(!fs.existsSync(path.join(root, 'BUILD_REPORT.txt')), 'BUILD_REPORT.txt must not exist');

console.log('hardware emulator static test passed');
