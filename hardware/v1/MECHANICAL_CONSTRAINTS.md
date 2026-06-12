# Mechanical constraints

## Stack target

Maintain a parameterized stack budget for front lens/bezel, display, adhesive,
PCB, tallest front/rear parts, battery, insulation, resin wall, and assembly
clearance. The nominal total is 8.5 mm; every value remains `TODO: VERIFY` until
measured from selected supplier drawings and samples.

The enclosure is not uniformly 8.5 mm thick. The LCD/body region targets
6.8 mm external thickness; only the lower LiPo pod may reach the 8.5 mm V1
maximum. The display region must remain thinner than the battery region in both
CAD and the machine-readable envelope.

The display and LiPo must not overlap in their XY projection. The current
planning floorplan places the 34.6 x 47.8 mm display in the upper front zone and
a rotated 25 x 20 mm 402025 battery in the lower rear zone. The expanded battery
keepout ends at y=22.5 mm and the display starts at y=23.0 mm. This 0.5 mm gap
proves separation but is not a released assembly tolerance.

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
- Use a radiused transition from the 6.8 mm LCD body to the 8.5 mm battery pod.
  Do not place the enclosure split directly on the pouch edge.

JLC3DP tolerances and minimum features vary by process/material and must be
recorded from the quote/help page before export. Future JLCCNC notes are
planning-only; aluminum remains out of V1.
