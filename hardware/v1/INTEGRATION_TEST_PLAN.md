# V1 integration test plan

This plan joins the public protocol package, ESP32-S3 firmware skeleton, and
power bring-up without requiring BLE hardware in the default test suite.

## Automated local checks

| Check | Command | Pass condition |
|---|---|---|
| Host protocol vectors | `node tests/v1-firmware-protocol-test.js` | Frame parse/build and deterministic responses match the firmware profile. |
| Artifact contract | `node tests/v1-integration-plan-test.js` | Required docs, netlists, UUIDs, safe defaults, and OTA planning warnings exist. |
| Full repository | `npm test` | Existing tests and clean-room audit pass. |
| SPICE decks | `ngspice -b <deck>` | Each `.cir` deck parses, runs, and prints finite measurements. |
| Firmware compile | `pio run -d firmware/v1-esp32s3` | Arduino ESP32-S3 build completes without producing committed binaries. |

## Bench sequence

1. Inspect PCB and verify all `TODO: VERIFY` pin mappings against the reviewed
   schematic and exact module datasheet.
2. Power from a current-limited source without battery, display, motor, or
   optional loads.
3. Capture idle 3V3, startup current, and serial boot output.
4. Connect from an authorized local BLE central and subscribe to notifications.
5. Write one deterministic CONTROL vector at a time and compare RX/TX logs.
6. Exercise malformed length, unknown command, invalid fragment state, and
   oversized frame cases; expect warnings and no notification.
7. Attach the display, then RGB, buttons, piezo, NFC I2C, and battery sense one
   subsystem at a time.
8. Keep the vibration motor DNP until electrical, mechanical, and EMI review.
9. Send synthetic FILE and OTA-category frames. Confirm ACK-only planning
   behavior and confirm no flash or firmware-update API is called.

## Evidence to retain

- Firmware commit SHA and PlatformIO package versions.
- Board/module marking and exact certification evidence, `TODO: VERIFY`.
- Current-limit setting, rail captures, thermal measurements, and ambient.
- Serial RX/TX logs containing synthetic vectors only.
- Display, battery, NFC loop, and peripheral part revisions.
- Human electrical/RF/mechanical/manufacturing review disposition.
