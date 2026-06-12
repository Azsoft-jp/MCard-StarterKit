# V1 hardware workspace

Planning workspace for a public-safe, 8.5 mm-class BLE animated badge prototype.
It is not a production-ready design or an official compatibility claim.

## Fixed V1 envelope

- PCB: 52 x 72 mm, 0.8 mm preferred; 1.0 mm fallback.
- Front: 2.0 inch-class 240 x 320 IPS TFT.
- Rear: protected LiPo and resin back case.
- Radio: ESP32-S3 module at a board edge; exact antenna keepout is mandatory.
- NFC: dynamic tag only, with a perimeter loop and no reader/writer function.
- I/O: USB-C power/programming, three buttons, side RGB light, piezo, optional vibration.

Start with [REQUIREMENTS.md](REQUIREMENTS.md), then follow the gates in
[ROADMAP.md](ROADMAP.md). All dimensions, footprints, supplier stock, and
manufacturing limits marked `TODO: VERIFY` must be resolved before ordering.
Human electrical review is mandatory before any schematic or PCB is treated as
buildable.

The current packaging proposal is defined by
[PRODUCT_DESIGN.md](PRODUCT_DESIGN.md),
[BOM_SELECTED_V1.md](BOM_SELECTED_V1.md), and the machine-readable
[mechanical/v1-envelope.json](mechanical/v1-envelope.json). The display and
LiPo keepouts are deliberately separated; run
`python3 tools/kicad-gen/validate_v1_design.py` after changing their
coordinates.

The `kicad/`, `fusion360/`, `mechanical/`, `jlcpcb/`, `jlc3dp/`, `jlccnc/`,
`simulation/`, `datasheets/`, `research/`, and `reviews/` directories hold the
handoff artifacts for each discipline. Human electrical, RF, mechanical, and
manufacturing review remains required.
