# V1 product design

This is a dimensional product direction, not an industrial-design release.
The source of truth for planning coordinates is
[`mechanical/v1-envelope.json`](mechanical/v1-envelope.json).

## Product character

- Nominal product outline: 49 x 99 mm including the top strap bridge.
- User-provided tolerance envelope: 49 +/- 10 mm by 99 +/- 30 mm. The nominal
  values are the V1 design datum until a tighter requirement is supplied.
- PCB planning outline: 46 x 84 mm. This retains 1.5 mm nominal side margins
  in the 49 mm body and uses the added height for controls and spacing.
- Two-level enclosure: 6.8 mm nominal over the LCD region and 8.5 mm maximum
  over the lower LiPo region.
- Entire front face is one continuous flat datum. There is no front chin,
  display step, raised bezel plane, or front battery bulge.
- The 1.7 mm thickness difference is formed only on the rear face as a shallow,
  radiused lower battery bulge.
- Uniform 49 mm body width with straight aligned side edges.
- Transparent smoke skeleton resin; no aluminum in V1. Internal PCB, cell
  boundary, ribs and fasteners may be visible but must remain orderly and
  electrically insulated.
- Flush front lens over a 2.0 inch-class portrait display.
- Three buttons on the lower rear face, arranged horizontally.
- Diffused RGB light guides on both left and right front edges, visually
  symmetric when viewed from the front.
- USB-C opening on the lower right edge.
- Integrated top-center resin strap bridge with non-metal textile strap.
- Original industrial science-fiction access-credential styling. Do not copy
  game logos, faction marks, UI, typography, characters, or proprietary assets.

The current generated
[concept image](mechanical/v1-product-concept-v4.png) communicates skeleton
resin, flat front, rear battery depth, rear button row, and bilateral RGB
intent. It is not dimensionally accurate and must not be traced for CAD, PCB,
openings, bosses, or antenna clearances. Earlier concepts are design history.

## Packaging decision

The extended enclosure permits a 46 x 84 mm PCB and larger vertical separation:

| Item | Planning rectangle, PCB origin at lower-left |
|---|---|
| Display panel | x 5.7-40.3, y 35.0-82.8 |
| Battery nominal | x 10.5-35.5, y 12.0-32.0 |
| Battery keepout | x 9.5-36.5, y 11.0-33.0 |
| Rear button row | x 4.0-42.0, y 3.0-8.0 |
| Left RGB guide | x 0.5-2.0, y 39.0-67.0 |
| Right RGB guide | x 44.0-45.5, y 39.0-67.0 |
| Display-to-battery keepout gap | 2.0 mm |

The display, expanded battery keepout, rear buttons and USB-C insertion volume
must remain separate. `TODO: VERIFY` all coordinates after measuring the
display tail, pouch seal, PCM/wires, button caps and USB connector sample.

## Regional thickness

| Region | Nominal external thickness | Rule |
|---|---:|---|
| LCD/body, y=33-84 mm | 6.8 mm | Front remains on the common flat datum |
| LiPo region, y=0-33 mm | 8.5 mm | Rear projects by 1.7 mm maximum |
| Strap bridge, above PCB | 6.8 mm target | Local ribs require strength/RF review |

The front lens/case uses one uninterrupted planar datum. The rear transition
starts near the expanded battery keepout boundary and uses a broad fillet or
short ramp. Do not mirror the step onto the front or widen the lower body.

The 6.8 mm region remains a tight target. `TODO: VERIFY` display, module shield,
solder, adhesive, lens, resin wall and assembly tolerance with physical parts.

## Strap architecture

- The bridge extends above the 46 x 84 mm PCB without a PCB slot or plated hole.
- Planning bridge envelope: x=13-33 mm, y=84-96 mm, with a 10 x 3.5 mm textile
  opening.
- The case body runs from y=-3 to y=87, giving 90 mm body height and 99 mm
  overall height through the bridge.
- Transfer load through integral resin shoulders, not the lens, display, PCB
  edge or NFC loop.
- Metal rings, eyelets, clips, buckles and magnetic attachments are prohibited
  near BLE/NFC in V1.
- Validate pull, torsion, fatigue, drop and resin aging.

## Board zoning

- Upper-right rear: ESP32-S3-MINI rotated with its antenna at the board edge.
  No display metal, NFC copper, battery, fastener, metallic pigment or case
  metal may enter the verified antenna keepout.
- Perimeter: NFC loop, detouring around BLE keepout, USB-C, mounting features
  and strap load-transfer shoulders.
- Lower center rear: battery only.
- Lower rear edge: three horizontal buttons below the battery keepout.
- Front left and right edges: symmetric RGB emitters/light guides. The
  upper-right guide must not introduce copper or metal into the BLE keepout.
- Front exterior: flat and continuous; battery clearance comes from the
  rear-only lower bulge.
- Lower-right edge: USB-C, ESD, CC resistors and short USB routing.
- Display lower edge: 14-position FPC connector and controlled bend region.

## Human factors

- Rear button order, left to right when viewing the rear: previous/back,
  action, next/menu.
- Use a different center-button texture or cap shape for eyes-free operation.
- Recess caps enough to avoid accidental actuation against clothing or a table.
- Keep display content inside the active area.
- Transparent resin must not expose identifying production data or unsafe
  conductive surfaces.
- Add a restrained prototype/radio-status label without claiming certification.

## Fusion 360 handoff

1. Import the reviewed 46 x 84 mm PCB STEP as a referenced component.
2. Create separate panel, FPC, battery keepout, lens, rear buttons, bilateral
   light guides, USB access, strap bridge/webbing and case components.
3. Drive dimensions from `v1-envelope.json`; do not trace the concept image.
4. Keep the entire front on one datum and put battery depth on the rear only.
5. Constrain upper and lower case widths to one 49 mm nominal parameter.
6. Model resin tint, optical interfaces and light-blocking masks separately.
7. Export STEP and controlled 2D opening drawings for review.

## Open verification

- `TODO: VERIFY` exact display drawing, tail, pinout and bend radius.
- `TODO: VERIFY` exact protected 402025 supplier, seal, PCM/wires, swelling,
  approvals and runtime.
- `TODO: VERIFY` resin walls, snaps, bosses, rear buttons, dual light guides and
  USB opening against the selected JLC3DP process.
- `TODO: VERIFY` transparent-resin optical quality, tint, UV aging, internal
  appearance, light leakage and electrical insulation.
- `TODO: VERIFY` 6.8 mm region fit and 8.5 mm rear battery bulge.
- `TODO: VERIFY` BLE keepout and NFC tuning after the 46 x 84 mm PCB change.
- `TODO: VERIFY` strap bridge strength and test acceptance criteria.
