# V1 power and firmware review checklist

## Power

- [ ] Exact charger, regulator, inductor, capacitors, limits, and footprints are
      verified against current official datasheets. `TODO: VERIFY`
- [ ] Battery polarity, protection, NTC strategy, swelling volume, connector,
      wiring, and safety documentation are verified. `TODO: VERIFY`
- [ ] 3V3 load-step assumptions are replaced by measured or vendor-model data.
      `TODO: VERIFY`
- [ ] Backlight, RGB, piezo, and vibration outputs have defined-off startup
      states.
- [ ] Optional vibration remains DNP until stall current, clamp, EMI, retention,
      and stack height pass review. `TODO: VERIFY`

## Firmware

- [ ] Every `mcard_v1_pins.h` placeholder is reconciled with the reviewed
      schematic and exact ESP32-S3 strap/USB rules. `TODO: VERIFY`
- [ ] BLE uses only the neutral sample UUIDs and advertises as `MCardKit-V1`.
- [ ] Write and notify characteristics use distinct UUIDs.
- [ ] No scan, connect, write, or notification occurs without user-powered
      startup and a central's explicit action.
- [ ] PING, GET_VERSION, GET_BATTERY, GET_FS_INFO, and GET_SERIAL return the
      documented deterministic values.
- [ ] Malformed or oversized frames fail closed and print a warning.
- [ ] FILE behavior is local sample ACK behavior only.
- [ ] OTA behavior is planning ACK behavior only and contains no real flashing.
- [ ] Serial logs contain no secret, non-public identifier, or proprietary data.

## RF, regulatory, and release

- [ ] Exact module antenna keepout and enclosure/metal exclusions are verified.
      `TODO: VERIFY`
- [ ] NFC loop tuning is measured on the assembled product; ngspice results are
      not presented as RF validation. `TODO: VERIFY`
- [ ] The specific module or finished product Japan radio certification
      applicability is verified. `TODO: VERIFY`
- [ ] Current JLCPCB/LCSC availability, assembly status, footprints, rotations,
      and DNP state are rechecked before ordering. `TODO: VERIFY`
- [ ] `npm test`, ngspice batch runs, and the optional PlatformIO build pass.
- [ ] Human electrical, RF, mechanical, and manufacturing reviews are recorded.
