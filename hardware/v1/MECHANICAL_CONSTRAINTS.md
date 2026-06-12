# Mechanical constraints

## Current-stage baseline lock

Keep the nominal 49 x 99 mm product, 46 x 84 mm PCB, and upper-display /
lower-LiPo separation. These are accepted PR-3 inputs, not placeholders to be
replaced by a conflicting initialization prompt. See
`PLACEMENT_CONSTRAINTS.md` and `MECHANICAL_STACKUP.md`.

## Stack target

Maintain a parameterized stack budget for front lens/bezel, display, adhesive,
PCB, tallest front/rear parts, battery, insulation, resin wall, and assembly
clearance. The nominal total is 8.5 mm; every value remains `TODO: VERIFY` until
measured from selected supplier drawings and samples.

The enclosure is not uniformly 8.5 mm thick. The LCD/body region targets
6.8 mm external thickness; only the lower LiPo region may reach the 8.5 mm V1
maximum. The display region must remain thinner than the battery region in both
CAD and the machine-readable envelope.

The front exterior is a single continuous flat plane. The upper and lower case
widths are identical and their left/right side edges align. The 1.7 mm
thickness transition is allowed on the rear face only; no front chin, front
step, wider lower body, waist, or taper is allowed.

The display and LiPo must not overlap in their XY projection. The current
planning floorplan places the 34.6 x 47.8 mm display in the upper front zone and
a rotated 25 x 20 mm 402025 battery in the lower rear zone. The expanded battery
keepout ends at y=33.0 mm and the display starts at y=35.0 mm. This 2.0 mm gap
remains a planning value rather than a released assembly tolerance.

See:

- `mechanical/v1-envelope.json` for coordinates.
- `mechanical/v1-floorplan.svg` for front/rear zoning.
- `mechanical/v1-stackup.svg` for separate region budgets.
- `PRODUCT_DESIGN.md` for the enclosure and human-interface direction.

Do not recover area by stacking the pouch cell under the display. Do not place
sharp solder joints, vias with rough protrusions, uninsulated conductors, hot
charger parts, or replaceable fasteners against the pouch.

## Layout handoff

- PCB origin, outline, mounting features, USB opening, button axes, display
  active area, FPC bend zone, antennas, battery envelope, and keepouts are named.
- Export a versioned STEP from KiCad; import into Fusion 360 as a linked milestone.
- Use a master component for the envelope and separate components for PCB,
  display, battery, lens, buttons, light guide, buzzer, and rear case.
- Keep resin wall, ribs, snap fits, screw bosses, clearances, shrink allowance,
  and drain/cleanup needs driven by the selected JLC3DP process.
- Put an explicit no-metal volume around BLE and NFC antennas.
- Offset USB-C to the bottom-right so its shell and insertion volume do not
  overlap the battery keepout.
- Keep the display backing outside the BLE antenna keepout even when the module
  body is mounted beneath another display region.
- Treat the battery keepout as larger than its nominal pouch dimensions to
  include seal, wire/PCM exit, insulation, adhesive and swelling.
- Add an integral top-center resin strap bridge outside the PCB outline. Do not
  add a PCB slot or metal eyelet for V1.
- Keep strap shoulders, textile and any future attachment hardware out of the
  BLE keepout and reviewed NFC loop clearance.
- Use a radiused rear-face transition from the 6.8 mm LCD body to the 8.5 mm
  battery region. Keep the front datum flat and do not place the enclosure split
  directly on the pouch edge.
- Place all three buttons horizontally on the lower rear below the expanded
  battery keepout.
- Provide symmetric front-visible RGB windows/light guides on both side edges.
- Treat transparent smoke resin as an optical/mechanical requirement; review
  light leakage, internal appearance, tint, UV aging and insulation.
- Use bare fixture-accessible test pads. Do not add pin headers to the thin
  product.

JLC3DP tolerances and minimum features vary by process/material and must be
recorded from the quote/help page before export. Future JLCCNC notes are
planning-only; aluminum remains out of V1.
