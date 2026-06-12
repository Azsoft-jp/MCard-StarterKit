# V1 product design

This is a dimensional product direction, not an industrial-design release.
The source of truth for planning coordinates is
[`mechanical/v1-envelope.json`](mechanical/v1-envelope.json).

## Product character

- Portrait badge, nominal PCB envelope 52 x 72 mm.
- Two-level enclosure: 6.8 mm nominal over the LCD region and 8.5 mm maximum
  only over the lower LiPo region.
- One continuous flat rear datum from top to bottom. There is no rear battery
  bulge, raised pod, recessed battery door, or rear thickness step.
- Uniform 54 mm planning case width through the LCD and LiPo regions, with
  straight aligned side edges. There is no wider lower body, waist, or taper.
- The 1.7 mm thickness difference is formed only on the front face: the lower
  front chin projects forward while the rear stays flat.
- Dark smoke or opaque resin back; no aluminum in V1.
- Flush front lens over a 2.0 inch-class portrait display.
- Three left-side buttons with distinguishable cap geometry.
- Diffused RGB light pipe on the right edge, outside the BLE antenna window.
- USB-C opening offset to the bottom-right so it does not occupy the battery
  volume.
- Integrated top-center strap bridge made from the enclosure resin, using a
  textile strap with no metal eyelet or ring.
- Original industrial science-fiction access-credential styling: segmented
  protective frame, restrained safety-orange accents, and abstract technical
  markings. Do not copy game logos, faction marks, UI, typography, characters,
  or proprietary assets.
- Rounded and chamfered features suitable for resin printing and hand
  finishing.

The current generated
[concept image](mechanical/v1-product-concept-v3.png) communicates appearance,
uniform width, flat rear, and front-only thickness-step intent. It is not
dimensionally accurate; any width/height annotations rendered in the image are
illustrative and must not be traced for CAD, PCB, openings, bosses, or antenna
clearances. Earlier concepts are retained as design history.

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

## Stepped thickness

| Region | Nominal external thickness | Rule |
|---|---:|---|
| LCD/body, y=22.5-72 mm | 6.8 mm | Must remain thinner than the LiPo region |
| LiPo region, y=0-22.5 mm | 8.5 mm | V1 maximum; front face projects 1.7 mm |
| Strap bridge, above PCB | 6.8 mm target | Local ribs may vary only after strength and RF review |

The rear wall uses one uninterrupted planar datum. The transition shoulder
starts on the front face at the expanded battery keepout boundary. Use a fillet
or short ramp instead of a sharp step to reduce resin stress and avoid a snag
edge. Do not mirror this step onto the rear or widen the lower body. The LCD
region must not inherit the 8.5 mm battery depth merely to simplify the case.

Nominal stack allowances currently leave about 0.2-0.5 mm less margin in the
LCD zone than the earlier uniform case concept. `TODO: VERIFY` the display,
module shield, solder, adhesive, lens, rear wall, and assembly tolerance with
physical samples before freezing 6.8 mm.

## Strap architecture

- The strap bridge is an enclosure extension above the 52 x 72 mm PCB; it does
  not require a PCB slot or plated/mechanical hole.
- Planning bridge envelope: x=17-35 mm, y=72-81 mm, with a 10 x 3.5 mm textile
  opening. Coordinates remain `TODO: VERIFY` for the selected strap webbing and
  JLC3DP resin.
- Transfer strap load through two integral side shoulders into the case frame,
  not through the lens, display, PCB edge, or NFC loop.
- Use a soft woven textile loop. Metal rings, eyelets, clips, buckles, and
  magnetic attachments are prohibited in V1 near BLE/NFC.
- Keep the upper-right BLE no-metal volume clear. The centered bridge is
  horizontally separated from that antenna zone.
- Add generous internal radii and validate drop, pull, torsion, and resin aging.
  A generated product render is not strength evidence.

## Board zoning

- Upper-right rear: ESP32-S3-MINI rotated with the PCB antenna at the board
  edge. No display metal, NFC copper, battery, fastener, pigment with metal
  content, or case metal may enter the final verified antenna keepout.
- Perimeter: NFC loop, except where it must detour around the BLE keepout,
  USB-C shell, mounting features, ESD return path, and strap load-transfer
  shoulders.
- Lower center rear: battery only; no tall components under its keepout.
- Rear exterior: flat and continuous; internal battery clearance is obtained
  from the front-only lower thickness increase.
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
   buttons, light pipe, USB plug access, strap bridge/webbing, and resin halves.
3. Drive dimensions from `v1-envelope.json`; do not hand-measure the concept
   image.
4. Model a removable case/service strategy without a metal plate or rear
   battery-door recess. The rear exterior must remain a single flat plane.
5. Constrain upper and lower case widths to the same parameter. Put the
   6.8/8.5 mm transition on the front face only.
6. Add datum features that make the front lens, panel active area, and PCB
   origin inspectable.
7. Export STEP and 2D opening drawings for the mechanical-envelope gate.

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
- `TODO: VERIFY` 6.8 mm LCD-region fit using measured samples and a complete
  tolerance stack.
- `TODO: VERIFY` strap webbing width, bridge wall/radius, selected resin
  strength, pull-test load, fatigue, and drop-test acceptance criteria.
- `TODO: VERIFY` that the flat rear wall and front-only lower expansion provide
  enough battery swelling/insulation clearance without exceeding 8.5 mm.
