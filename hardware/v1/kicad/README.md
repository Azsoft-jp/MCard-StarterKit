# MCard V1 KiCad schematic scaffold

`MCard_V1.kicad_pro` and `MCard_V1.kicad_sch` are generated starter files for
the V1 hardware study. They require human electrical review and are not
electrically verified or approved for fabrication.

The schematic is intentionally note-only. It names the planned sections and BOM
directions without inventing symbols, pins, nets, footprints, or assembly
decisions that have not passed the V1 review gates.

## Planned sections

- Power input and LiPo charger
- 3.3 V power rail
- ESP32-S3 module
- USB-C / USB data / ESD
- 240x320 TFT display connector
- Dynamic NFC tag and I2C
- Optional SPI NOR flash
- RGB LEDs
- Buttons
- Piezo buzzer
- Optional vibration motor driver
- Battery voltage measurement
- Test pads

Each section includes:

- `TODO: VERIFY` exact footprint and land pattern
- `TODO: VERIFY` datasheet-confirmed pinout and electrical limits
- `TODO: VERIFY` JLCPCB assembly status, orientation, and DNP/manual state

## RF and antenna boundary

- Place the ESP32-S3 module antenna at the board edge only after copying the
  exact selected-module keepout from the current datasheet.
- Keep copper, ground, the battery, display metal, connector shells, fasteners,
  and enclosure metal out of the verified BLE keepout.
- Reserve the NFC perimeter loop, matching network, links, and measurement pads.
- Treat NFC loop geometry and tuning as unverified until measured on assembled
  hardware with the display, battery, enclosure, and nearby copper present.
- Do not use an ERC result or lumped simulation as evidence that either antenna
  is correct.

## Placement boundary

- Keep the nominal 49 x 99 mm product, 46 x 84 mm PCB, and upper-display /
  lower-battery placement.
- Align USB-C, buttons, RGB emitters, display FPC, piezo, optional motor, and
  test pads with `PLACEMENT_DEPENDENCIES.md`.
- Use bare pogo pads; no pin headers in the finished thin product.

## Workflow

```bash
python3 tools/kicad-gen/generate_v1_schematic.py
python3 tools/kicad-gen/generate_v1_schematic.py --check
python3 tools/kicad-gen/validate_v1_design.py
kicad-cli sch erc hardware/v1/kicad/MCard_V1.kicad_sch \
  --output /tmp/MCard_V1-erc.rpt
```

Open the project with KiCad 9 and complete
`SCHEMATIC_REVIEW_CHECKLIST.md` before treating any later populated schematic
as a design-review candidate. PCB layout, DRC, fabrication outputs, and ordering
remain out of scope for this scaffold.
