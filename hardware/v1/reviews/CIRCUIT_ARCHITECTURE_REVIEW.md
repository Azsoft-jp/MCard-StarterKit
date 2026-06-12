# Circuit architecture review

## Status

- Stage: current PR-3 correction
- Scope: placement-aware schematic block coverage
- Result: CONDITIONAL / HUMAN ELECTRICAL REVIEW REQUIRED
- Electrical verification: NOT PERFORMED

## Findings

- The architecture covers USB-C input, native USB programming/debug, ESD,
  charger/power path, battery connector, 3.3 V rail, ESP32-S3 straps and
  recovery, TFT/FPC, backlight control, dynamic NFC/I2C, optional SPI NOR, RGB,
  buttons, piezo, optional vibration, battery measurement, and test pads.
- DNP/manual-install states are required for the optional motor, optional
  external flash, display, battery, and other off-board parts as applicable.
- The generated schematic remains note-only. No symbol, net, pinout, footprint,
  component value, or assembly decision is electrically approved.

## Open gates

- `TODO: VERIFY` exact datasheet pinouts and electrical limits.
- `TODO: VERIFY` footprints, land patterns, courtyards, paste, polarity, and
  connector orientation.
- `TODO: VERIFY` power budget, charge settings, thermals, backlight drive,
  battery measurement leakage/range, piezo drive, and motor clamp.
- `TODO: VERIFY` JLCPCB/LCSC stock, lifecycle, basic/extended class, rotation,
  side, and assembly eligibility.
- Run ERC on the populated schematic and record every disposition.
