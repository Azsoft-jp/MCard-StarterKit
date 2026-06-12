# V1 product design

This is a dimensional product direction, not an industrial-design release.
The source of truth for planning coordinates is
[`mechanical/v1-envelope.json`](mechanical/v1-envelope.json).

## Product character

- Portrait badge, nominal PCB envelope 52 x 72 mm.
- Maximum target thickness: 8.5 mm.
- Dark smoke or opaque resin back; no aluminum in V1.
- Flush front lens over a 2.0 inch-class portrait display.
- Three left-side buttons with distinguishable cap geometry.
- Diffused RGB light pipe on the right edge, outside the BLE antenna window.
- USB-C opening offset to the bottom-right so it does not occupy the battery
  volume.
- Rounded outside corners suitable for resin printing and hand finishing.

The generated [concept image](mechanical/v1-product-concept.png) communicates
appearance only. It is not dimensionally accurate and must not be traced for
CAD, PCB, openings, bosses, or antenna clearances.

## Packaging decision

The display panel occupies the front upper zone. A protected 402025 LiPo is
rotated so its 20 mm dimension runs vertically in the rear lower zone. Their
projected keepouts do not overlap:

| Item | Planning rectangle, origin at PCB lower-left |
|---|---|
| Display panel | x 8.7-43.3, y 23.0-70.8 |
| Battery nominal | x 13.5-38.5, y 1.5-21.5 |
| Battery keepout | x 12.5-39.5, y 0.5-22.5 |
| Nominal display-to-battery keepout gap | 0.5 mm |

The 0.5 mm planning gap is only enough to prove geometric separation.
`TODO: VERIFY` increase it after the display tail, cell pouch seal, insulation,
assembly tolerance, and swelling limits are measured.

## Board zoning

- Upper-right rear: ESP32-S3-MINI rotated with the PCB antenna at the board
  edge. No display metal, NFC copper, battery, fastener, pigment with metal
  content, or case metal may enter the final verified antenna keepout.
- Perimeter: NFC loop, except where it must detour around the BLE keepout,
  USB-C shell, mounting features, and ESD return path.
- Lower center rear: battery only; no tall components under its keepout.
- Bottom-right: USB-C, ESD, CC resistors, and short USB routing.
- Lower-left: charger and power conversion, with copper area reserved for
  thermal spreading and away from the cell pouch.
- Display lower edge: 14-position 0.5 mm FPC connector and controlled bend/slot
  region.
- Left edge: three switches.
- Rear display-overlap zones: low-profile logic parts and piezo are permitted
  only when the complete stack remains below 8.5 mm.

## Human factors

- Button order, top to bottom: previous/back, action, next/menu.
- Use different center-button texture or cap height for eyes-free operation.
- Avoid accidental button actuation when the device lies face-up.
- Keep display content inside the active area; the visual-area edge is not a
  reliable pixel boundary.
- Add a rear label recess for prototype ID, battery warning, and radio
  certification status. Do not claim Japan certification without exact
  evidence for the module and finished product.

## Fusion 360 handoff

1. Import the versioned PCB STEP and lock it as a referenced component.
2. Create separate components for panel, FPC/tail, battery keepout, lens,
   buttons, light pipe, USB plug access, and resin halves.
3. Drive dimensions from `v1-envelope.json`; do not hand-measure the concept
   image.
4. Model a removable rear or full-rear service strategy without a metal plate.
5. Add datum features that make the front lens, panel active area, and PCB
   origin inspectable.
6. Export STEP and 2D opening drawings for the mechanical-envelope gate.

## Open verification

- `TODO: VERIFY` exact ER-TFT020-3 drawing, tail direction, 14-pin pinout,
  connector contact orientation, and bend radius.
- `TODO: VERIFY` exact protected 402025 supplier, pouch seal, wire exit, PCM
  location, swelling allowance, safety approvals, and realistic runtime.
- `TODO: VERIFY` resin wall, snap, boss, button, light-pipe, and USB opening
  tolerances against the chosen JLC3DP material/process.
- `TODO: VERIFY` antenna keepout with the current Espressif datasheet revision
  and an RF reviewer.
- `TODO: VERIFY` piezo sound path and actual stack height.
