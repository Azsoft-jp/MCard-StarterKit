# Mechanical handoff

Track the 8.5 mm tolerance stack, component envelopes, antenna no-go volumes,
resin case revisions, and fit-test results here.

- `v1-envelope.json`: machine-readable board and placement rectangles.
- `v1-floorplan.svg`: front/rear zoning and antenna/NFC planning.
- `v1-stackup.svg`: separate display and battery thickness budgets.
- `v1-product-concept.png`: non-dimensional appearance reference only.

Run `python3 tools/kicad-gen/validate_v1_design.py` after any coordinate change.
The validator rejects display/battery, display/BLE-keepout, and
battery/USB-C overlap.
