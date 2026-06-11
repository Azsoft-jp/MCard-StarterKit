# Mechanical constraints

## Stack target

Maintain a parameterized stack budget for front lens/bezel, display, adhesive,
PCB, tallest front/rear parts, battery, insulation, resin wall, and assembly
clearance. The nominal total is 8.5 mm; every value remains `TODO: VERIFY` until
measured from selected supplier drawings and samples.

## Layout handoff

- PCB origin, outline, mounting features, USB opening, button axes, display
  active area, FPC bend zone, antennas, battery envelope, and keepouts are named.
- Export a versioned STEP from KiCad; import into Fusion 360 as a linked milestone.
- Use a master component for the envelope and separate components for PCB,
  display, battery, lens, buttons, light guide, buzzer, and rear case.
- Keep resin wall, ribs, snap fits, screw bosses, clearances, shrink allowance,
  and drain/cleanup needs driven by the selected JLC3DP process.
- Put an explicit no-metal volume around BLE and NFC antennas.

JLC3DP tolerances and minimum features vary by process/material and must be
recorded from the quote/help page before export. Future JLCCNC notes are
planning-only; aluminum remains out of V1.
