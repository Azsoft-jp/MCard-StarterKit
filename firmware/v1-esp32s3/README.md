# MCardKit V1 ESP32-S3 firmware skeleton

This PlatformIO/Arduino project is a public-safe bring-up skeleton for the V1
prototype. It is not official firmware and does not claim compatibility with
any commercial device.

## Safe default behavior

- Advertises the neutral sample service as `MCardKit-V1`.
- Exposes separate write and notify characteristics.
- Waits for a user-controlled BLE central to connect, subscribe, and write.
- Prints serial RX/TX hex logs.
- Returns deterministic sample responses for PING, GET_VERSION, GET_BATTERY,
  GET_FS_INFO, and GET_SERIAL.
- Returns local sample FILE ACKs and mock/planning OTA ACKs.
- Does not scan, initiate a connection, contact a cloud service, or flash
  firmware.
- Keeps all product GPIO assignments at `-1`; backlight, RGB, piezo, and
  optional vibration remain disabled. The separate Wokwi environment enables
  only a documented simulation heartbeat on GPIO4.

## Build

```bash
pio run -d firmware/v1-esp32s3
```

## Optional Wokwi integration test

The checked-in Wokwi project uses an ESP32-S3 DevKitC-1 as a firmware execution
substitute plus a simulation-only LED and logic analyzer on GPIO4. Build and
validate it with:

```bash
pio run -d firmware/v1-esp32s3 -e wokwi-esp32-s3-devkitc-1
wokwi-cli lint firmware/v1-esp32s3 --warnings-as-errors
wokwi-cli firmware/v1-esp32s3 \
  --expect-text "Wokwi simulation ready" \
  --vcd-file /tmp/mcard-v1-heartbeat.vcd
```

Wokwi CLI simulation requires `WOKWI_CLI_TOKEN`; do not commit it. The default
`npm test` remains offline and secret-free. See
`WOKWI_PART_SUBSTITUTIONS.md` for the exact substitution limits. The generated
VCD confirms only simulated digital heartbeat timing, not physical electrical,
RF, thermal, mechanical, or manufacturing behavior.

The Wokwi build skips BLE radio initialization and prints the explicit
simulation marker instead. BLE source still compiles in both PlatformIO
environments, while protocol behavior is covered by deterministic host tests.
Do not interpret the Wokwi run as BLE advertising or interoperability evidence.

Upload only to a board you own or are authorized to test:

```bash
pio run -d firmware/v1-esp32s3 -t upload
pio device monitor -b 115200
```

The PlatformIO target uses `esp32-s3-devkitc-1` only as a compile/bring-up
baseline. `TODO: VERIFY` the exact ESP32-S3 module variant, flash/PSRAM
configuration, board definition, pinout, strapping behavior, USB path, antenna
keepout, and Japan radio certification applicability.

## Sample vectors

```text
PING request:
1F 00 02 00 00 00

PING response:
1F 00 06 00 01 00 50 4F 4E 47

GET_VERSION request:
1F 00 02 00 14 00

GET_VERSION response:
1F 00 07 00 15 00 30 2E 31 2E 30
```

## Hardware bring-up limits

`include/mcard_v1_pins.h` intentionally contains `-1` placeholders for every
product GPIO. The GPIO4 definition exists only under `MCARD_WOKWI_SIM` and is
not a product assignment. Replace a product pin only after checking the
reviewed schematic, exact module datasheet, strap pins, native USB pins, FPC
pinout, test access, and startup state. The display file intentionally does not
guess a controller library. Battery percentage remains sample data until the
divider, ADC calibration, and protected-cell curve are verified.

OTA-category frames are parsed only to return a deterministic planning ACK.
There is no partition writer, bootloader update, firmware image, or real-device
flashing path in this project.
