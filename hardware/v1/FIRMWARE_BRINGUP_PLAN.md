# V1 ESP32-S3 firmware bring-up plan

The firmware under `firmware/v1-esp32s3/` is a local-first Arduino/PlatformIO
skeleton. It advertises only after `setup()` runs on user-powered hardware and
never initiates a BLE connection or write.

## Milestones

1. **Compile-only skeleton**
   - Build for `esp32-s3-devkitc-1`.
   - Keep all product GPIO assignments as `TODO: VERIFY`.
   - Confirm no cloud endpoint, token, proprietary asset, or binary image.
2. **Serial and safe defaults**
   - Print boot and RX/TX hex logs at 115200 baud.
   - Leave backlight, RGB, piezo, and optional vibration disabled.
3. **BLE peripheral**
   - Advertise as `MCardKit-V1`.
   - Expose the neutral sample service plus separate write and notify
     characteristics.
   - Require an explicit central connection and explicit characteristic write.
4. **Protocol**
   - Parse the public outer frame and CONTROL / FILE / OTA payload shapes.
   - Return deterministic sample responses for PING, GET_VERSION, GET_BATTERY,
     GET_FS_INFO, and GET_SERIAL.
   - Treat FILE writes as local sample transfers only.
   - Treat OTA writes as planning frames only; never flash a real device.
5. **Board integration**
   - Replace `-1` pin placeholders only after schematic, strap, USB, display,
     and test-fixture review.
   - Verify each peripheral independently before enabling combined operation.
6. **Optional Wokwi integration**
   - Build the dedicated `wokwi-esp32-s3-devkitc-1` environment.
   - Lint the diagram against the current Wokwi registry.
   - Assert the explicit Wokwi simulation-ready serial marker.
   - Export the simulation-only GPIO4 heartbeat to VCD.
   - Keep substitutions and intentionally unmodeled behavior documented.
   - Do not treat the run as BLE radio or interoperability evidence.

## Initial serial evidence

```text
MCardKit-V1 boot
Pins are placeholders; outputs remain disabled
Advertising as MCardKit-V1
RX 1F 00 02 00 14 00
TX 1F 00 07 00 15 00 30 2E 31 2E 30
```

## Blocking `TODO: VERIFY`

- Exact ESP32-S3 module variant, board definition, flash/PSRAM settings, module
  land pattern, antenna keepout, and Japan certification applicability.
- GPIO allocation including strapping pins, native USB pins, JTAG/UART, FPC,
  I2C, optional flash, LEDs, buttons, buzzer, motor, and battery ADC.
- Ordered display controller, FPC pinout, backlight topology, and display
  library configuration.
- Battery divider, ADC attenuation/calibration, charger status signals, and
  battery percentage curve.
- BLE security, bonding, connection parameters, MTU, throughput, and power
  budget for the intended product behavior.
