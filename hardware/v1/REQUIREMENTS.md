# V1 requirements

## Product

- Local-first BLE animated badge experiment using neutral public-safe protocols.
- ESP32-S3 module, 240 x 320 SPI TFT, dynamic NFC tag, LiPo, USB-C, three
  buttons, RGB side light, piezo, and optional vibration footprint.
- No vendor cloud, proprietary firmware/assets, automatic BLE writes, real OTA
  flashing, or official compatibility claim.

## Physical and manufacturing

- PCB outline: 52 x 72 mm.
- PCB thickness: 0.8 mm target, 1.0 mm fallback after flex/availability review.
- Finished thickness target: 8.5 mm class, with an explicit component stack.
- Display faces front; battery and resin back case are rear.
- JLCPCB PCBA-oriented; prefer current LCSC-stocked parts without sacrificing safety.
- Fusion 360 handoff uses STEP for solids and DXF only for controlled 2D profiles.
- JLC3DP resin is the V1 enclosure route. Aluminum is deferred to V2/V3.

## Electrical and RF

- BLE antenna sits at the PCB edge with the exact module keepout.
- NFC loop follows the perimeter but must not enter the BLE keepout.
- Battery, metal, copper pours, display frame, fast edges, and noisy power loops
  stay away from antenna regions as required by reviewed layout rules.
- USB-C operates as a USB 2.0 device/sink; CC resistors, ESD, D+/D- routing, and
  charger input limits must match selected parts and official references.
- All battery charging and protection choices require thermal and safety review.

## Verification

- All unverified dimensions, MPNs, footprints, LCSC status, and rules use
  `TODO: VERIFY`.
- Generated design artifacts are planning aids only until reviewed in KiCad.
- BLE use in Japan requires verification of the exact module or finished-product
  certification; no SoC/module is assumed automatically certified.
