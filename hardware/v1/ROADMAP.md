# V1 hardware roadmap

Each gate needs a dated review record under `reviews/` with owner, evidence,
open items, and pass/fail status. A pass cannot contain unresolved blocking
`TODO: VERIFY` items.

| Gate | Required evidence |
|---|---|
| Requirements | V1 scope and 8.5 mm stack accepted |
| Research/source verification | Primary-source links checked and dated |
| BOM | MPN, package, lifecycle, stock, price, and alternates checked |
| Schematic | ERC, pin/strap review, power budget, connector pinout review |
| PCB layout | DRC, stack-up, antenna keepouts, current paths, test access |
| Mechanical envelope | STEP fit, display/FPC/battery/case tolerances |
| Simulation | Starter models run; assumptions and limits recorded |
| RF/NFC antenna review | BLE keepout and NFC tuning plan reviewed by qualified engineer |
| Japan radio certification note | Exact module/product certification status recorded |
| Pre-JLC order | Gerber, drill, BOM, CPL, rotations, polarity, panel and assembly preview checked |

## Milestones

1. Freeze requirements, source register, and candidate BOM.
2. Convert the selected direction in `BOM_SELECTED_V1.md` into exact,
   drawing-verified orderable parts.
3. Produce and review schematic; do not release PCB from an unreviewed generator output.
4. Review and refine the machine-checked 46 x 84 mm floorplan around the
   display/battery split, BLE/NFC keepouts, USB opening, and mechanical stack.
5. Route, run ERC/DRC, review power integrity, and create tuning/test coupons if needed.
6. Complete Fusion 360 enclosure handoff and resin prototype checks.
7. Run low-frequency simulations/calculations and document measured bring-up tests.
8. Complete manufacturing and regulatory gates before any order.

## Acceptance criteria

- Overall design targets 8.5 mm, not 6.7 mm, with a documented tolerance stack.
- The LCD region is thinner than the LiPo region; current nominal targets are
  6.8 mm and 8.5 mm respectively.
- Front exterior is flat, upper/lower case widths match, and the thickness
  transition appears only on the rear face.
- Display and expanded LiPo keepouts have no XY overlap and pass the deterministic
  envelope validator.
- Resin V1 enclosure contains no metal over BLE or NFC antenna regions.
- Product nominal outline is 49 x 99 mm including the strap bridge.
- PCB is 46 x 84 mm or a mechanically approved revision, using 0.8 mm or
  explicitly approved 1.0 mm thickness.
- Selected display, battery, USB-C, module, connector and side controls fit the
  reviewed front/rear placement zones with assembly tolerances.
- Rear lower buttons, bilateral front-visible RGB guides and transparent resin
  pass fit, optical and human-factors review.
- The resin strap bridge uses no PCB hole or metal fitting, clears BLE/NFC
  review zones, and passes defined pull/fatigue/drop tests.
- Exact module antenna keepout, strapping pins, USB, charging, and power rules are verified.
- Dynamic NFC tag and tuned loop are reviewed; no NFC reader/writer is implemented.
- BOM/CPL use verified MPNs, footprints, rotations, and current JLC/LCSC status.
- KiCad ERC/DRC and human electrical/RF/mechanical reviews are recorded.
- Japan BLE operation is blocked until exact certification applicability is verified.
- No proprietary firmware, assets, endpoints, captures, or compatibility claims are present.
