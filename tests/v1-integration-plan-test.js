'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  CATEGORY,
  CONTROL_COMMAND,
  SAMPLE
} = require('../packages/v1-protocol');

const root = path.join(__dirname, '..');
const firmwareRoot = path.join(root, 'firmware/v1-esp32s3');
const serviceUuid = '7a2f0000-2b3c-4d5e-8f90-000000000000';
const writeUuid = '7a2f0002-2b3c-4d5e-8f90-000000000000';
const notifyUuid = '7a2f0003-2b3c-4d5e-8f90-000000000000';

const requiredFiles = [
  'hardware/v1/SIMULATION_PLAN.md',
  'hardware/v1/POWER_TREE.md',
  'hardware/v1/FIRMWARE_BRINGUP_PLAN.md',
  'hardware/v1/INTEGRATION_TEST_PLAN.md',
  'hardware/v1/reviews/POWER_FIRMWARE_REVIEW_CHECKLIST.md',
  'hardware/v1/simulation/README.md',
  'hardware/v1/simulation/power_3v3_load_step.cir',
  'hardware/v1/simulation/rgb_led_current_limit.cir',
  'hardware/v1/simulation/vibration_motor_driver.cir',
  'hardware/v1/simulation/backlight_pwm_estimate.cir',
  'hardware/v1/simulation/charger_thermal_estimate.md',
  'hardware/v1/simulation/nfc_loop_lumped_estimate.md',
  'firmware/v1-esp32s3/README.md',
  'firmware/v1-esp32s3/WOKWI_PART_SUBSTITUTIONS.md',
  'firmware/v1-esp32s3/diagram.json',
  'firmware/v1-esp32s3/platformio.ini',
  'firmware/v1-esp32s3/wokwi.toml',
  'firmware/v1-esp32s3/src/main.cpp',
  'firmware/v1-esp32s3/include/mcard_v1_pins.h',
  'firmware/v1-esp32s3/include/mcard_v1_profile.h',
  'firmware/v1-esp32s3/include/mcard_v1_protocol.h',
  'firmware/v1-esp32s3/src/mcard_v1_protocol.cpp',
  'firmware/v1-esp32s3/src/mcard_v1_ble.cpp',
  'firmware/v1-esp32s3/src/mcard_v1_display.cpp',
  'firmware/v1-esp32s3/src/mcard_v1_power.cpp',
  'firmware/v1-esp32s3/src/mcard_v1_ui.cpp',
  'packages/v1-protocol/index.js',
  'packages/v1-protocol/README.md'
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} missing`);
}

const profile = fs.readFileSync(
  path.join(firmwareRoot, 'include/mcard_v1_profile.h'),
  'utf8'
);
const pins = fs.readFileSync(
  path.join(firmwareRoot, 'include/mcard_v1_pins.h'),
  'utf8'
);
const ble = fs.readFileSync(
  path.join(firmwareRoot, 'src/mcard_v1_ble.cpp'),
  'utf8'
);
const power = fs.readFileSync(
  path.join(firmwareRoot, 'src/mcard_v1_power.cpp'),
  'utf8'
);
const protocol = fs.readFileSync(
  path.join(firmwareRoot, 'src/mcard_v1_protocol.cpp'),
  'utf8'
);
const firmwareReadme = fs.readFileSync(
  path.join(firmwareRoot, 'README.md'),
  'utf8'
);
const platformio = fs.readFileSync(
  path.join(firmwareRoot, 'platformio.ini'),
  'utf8'
);
const diagram = JSON.parse(fs.readFileSync(
  path.join(firmwareRoot, 'diagram.json'),
  'utf8'
));
const wokwiConfig = fs.readFileSync(
  path.join(firmwareRoot, 'wokwi.toml'),
  'utf8'
);
const wokwiSubstitutions = fs.readFileSync(
  path.join(firmwareRoot, 'WOKWI_PART_SUBSTITUTIONS.md'),
  'utf8'
);
const cleanroomAudit = fs.readFileSync(
  path.join(root, 'tools/repo-audit/audit-cleanroom.mjs'),
  'utf8'
);

assert.ok(profile.includes(serviceUuid), 'neutral service UUID missing');
assert.ok(profile.includes(writeUuid), 'neutral write UUID missing');
assert.ok(profile.includes(notifyUuid), 'neutral notify UUID missing');
assert.notStrictEqual(writeUuid, notifyUuid, 'write and notify UUIDs must differ');
assert.match(profile, /MCardKit-V1/);
assert.match(platformio, /board\s*=\s*esp32-s3-devkitc-1/);
assert.match(platformio, /framework\s*=\s*arduino/);
assert.match(platformio, /MCARD_WOKWI_SIM/);
assert.match(wokwiConfig, /wokwi-esp32-s3-devkitc-1\/firmware\.bin/);
assert.match(
  fs.readFileSync(path.join(firmwareRoot, 'src/main.cpp'), 'utf8'),
  /Wokwi simulation ready/
);
assert.ok(
  diagram.parts.some((part) => part.type === 'board-esp32-s3-devkitc-1'),
  'Wokwi ESP32-S3 board missing'
);
assert.ok(
  diagram.parts.some((part) => part.type === 'wokwi-logic-analyzer'),
  'Wokwi logic analyzer missing'
);
assert.ok(
  diagram.connections.some(
    (connection) => connection[0] === 'esp:4' && connection[1] === 'logic:D0'
  ),
  'simulation heartbeat must connect to logic analyzer D0'
);
assert.ok(
  diagram.connections.some(
    (connection) => connection[0] === 'esp:TX' &&
      connection[1] === '$serialMonitor:RX'
  ),
  'ESP32-S3 UART TX must connect to the Wokwi serial monitor'
);
assert.match(wokwiSubstitutions, /TODO: VERIFY/);
assert.match(wokwiSubstitutions, /not represent.*RF.*power integrity/is);
assert.match(wokwiSubstitutions, /BLE radio initialization is skipped/);
assert.match(firmwareReadme, /WOKWI_CLI_TOKEN/);
assert.match(firmwareReadme, /not.*physical electrical.*RF/is);

for (const command of [
  'CONTROL_PING',
  'CONTROL_GET_VERSION',
  'CONTROL_GET_BATTERY',
  'CONTROL_GET_FS_INFO',
  'CONTROL_GET_SERIAL'
]) {
  assert.ok(profile.includes(command), `${command} missing from firmware profile`);
  assert.ok(protocol.includes(command), `${command} missing from response logic`);
}

function firmwareInteger(name) {
  const match = profile.match(
    new RegExp(`constexpr (?:uint8_t|uint16_t|uint32_t) ${name} = (0x[0-9a-f]+|[0-9]+);`, 'i')
  );
  assert.ok(match, `${name} numeric constant missing`);
  return Number(match[1]);
}

assert.strictEqual(firmwareInteger('CATEGORY_OTA'), CATEGORY.OTA);
assert.strictEqual(firmwareInteger('CATEGORY_FILE'), CATEGORY.FILE);
assert.strictEqual(firmwareInteger('CATEGORY_CONTROL'), CATEGORY.CONTROL);
assert.strictEqual(firmwareInteger('CONTROL_PING'), CONTROL_COMMAND.PING);
assert.strictEqual(firmwareInteger('CONTROL_PONG'), CONTROL_COMMAND.PONG);
assert.strictEqual(firmwareInteger('CONTROL_GET_SERIAL'), CONTROL_COMMAND.GET_SERIAL);
assert.strictEqual(
  firmwareInteger('CONTROL_SERIAL_RESPONSE'),
  CONTROL_COMMAND.SERIAL_RESPONSE
);
assert.strictEqual(firmwareInteger('CONTROL_GET_VERSION'), CONTROL_COMMAND.GET_VERSION);
assert.strictEqual(
  firmwareInteger('CONTROL_VERSION_RESPONSE'),
  CONTROL_COMMAND.VERSION_RESPONSE
);
assert.strictEqual(firmwareInteger('CONTROL_GET_BATTERY'), CONTROL_COMMAND.GET_BATTERY);
assert.strictEqual(
  firmwareInteger('CONTROL_BATTERY_RESPONSE'),
  CONTROL_COMMAND.BATTERY_RESPONSE
);
assert.strictEqual(firmwareInteger('CONTROL_GET_FS_INFO'), CONTROL_COMMAND.GET_FS_INFO);
assert.strictEqual(
  firmwareInteger('CONTROL_FS_INFO_RESPONSE'),
  CONTROL_COMMAND.FS_INFO_RESPONSE
);
assert.strictEqual(
  firmwareInteger('SAMPLE_BATTERY_PERCENT'),
  SAMPLE.BATTERY_PERCENT
);
assert.strictEqual(firmwareInteger('SAMPLE_FS_BLOCK_SIZE'), SAMPLE.FS_BLOCK_SIZE);
assert.strictEqual(
  firmwareInteger('SAMPLE_FS_TOTAL_BLOCKS'),
  SAMPLE.FS_TOTAL_BLOCKS
);
assert.strictEqual(
  firmwareInteger('SAMPLE_FS_FREE_BLOCKS'),
  SAMPLE.FS_FREE_BLOCKS
);
assert.ok(profile.includes(`SAMPLE_VERSION[] = "${SAMPLE.VERSION}"`));
assert.ok(profile.includes(`SAMPLE_SERIAL[] = "${SAMPLE.SERIAL}"`));

assert.match(pins, /TODO: VERIFY every assignment/);
assert.ok(
  (pins.match(/= -1;/g) || []).length >= 15,
  'product GPIOs must remain disabled placeholders'
);
assert.match(power, /VIBRATION_ENABLE/);
assert.match(power, /digitalWrite\(pin, LOW\)/);
assert.match(ble, /PROPERTY_WRITE/);
assert.match(ble, /PROPERTY_NOTIFY/);
assert.match(ble, /printHex\("RX "/);
assert.match(ble, /printHex\("TX "/);
assert.match(ble, /notifyCharacteristic->notify\(\)/);
assert.match(protocol, /responseIncludesPacketIndex/);
assert.match(protocol, /FILE_DATA_RESPONSE/);
assert.match(protocol, /OTA_DATA_RESPONSE/);
assert.match(firmwareReadme, /planning ACK/i);
assert.match(firmwareReadme, /does not scan/i);
assert.match(firmwareReadme, /does not.*flash|no partition writer/is);
assert.match(
  cleanroomAudit,
  /generatedDirectories[\s\S]*['"]\.pio['"]/,
  'clean-room audit must ignore transient PlatformIO build output'
);

const docs = [
  'hardware/v1/POWER_TREE.md',
  'hardware/v1/FIRMWARE_BRINGUP_PLAN.md',
  'hardware/v1/INTEGRATION_TEST_PLAN.md',
  'hardware/v1/reviews/POWER_FIRMWARE_REVIEW_CHECKLIST.md',
  'hardware/v1/simulation/nfc_loop_lumped_estimate.md'
].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
assert.match(docs, /TODO: VERIFY/);
assert.match(docs, /Japan radio certification/i);
assert.match(docs, /not.*RF.*validation|cannot validate.*RF/is);

const forbiddenSourcePatterns = [
  /\bUpdate\.h\b/,
  /\besp_ota_/,
  /\bHTTPClient\b/,
  /\bWiFiClient\b/,
  /vendor cloud/i
];
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
    if (entry.name === '.pio') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

for (const file of walk(firmwareRoot)) {
  assert.ok(
    !forbiddenExtensions.has(path.extname(file).toLowerCase()),
    `forbidden firmware artifact: ${path.relative(root, file)}`
  );
  if (/\.(cpp|h|ini|md)$/.test(file)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenSourcePatterns) {
      assert.ok(
        !pattern.test(source),
        `forbidden firmware behavior ${pattern} in ${path.relative(root, file)}`
      );
    }
  }
}

console.log('V1 integration plan tests passed');
