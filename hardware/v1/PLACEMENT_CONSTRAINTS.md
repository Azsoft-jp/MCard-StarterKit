# V1 placement constraints

This document is the placement-first handoff for the current PR-3 KiCad
schematic scaffold correction. It adds missing early constraints without
renumbering the roadmap or changing the accepted V1 geometry.

## Locked planning baseline

- Product envelope: nominal 49 x 99 mm including the resin strap bridge.
- PCB: 46 x 84 mm, 0.8 mm preferred and 1.0 mm fallback.
- Display: upper front zone.
- Protected LiPo: lower rear zone, separated from the display in XY.
- Enclosure: flat front, 6.8 mm LCD/body region, rear-only transition to the
  8.5 mm lower LiPo region.
- V1 back case: resin. Aluminum remains deferred to V2/V3.

In short: keep the upper display and lower rear LiPo placement.

Do not replace this baseline with a 52 x 72 mm PCB or a display-over-battery
stack in later planning prompts. Any future dimensional change requires an
explicit mechanical change request, updated envelope JSON/CAD, deterministic
validation, and a recorded mechanical/RF review.

## Placement order

1. Freeze the PCB outline, display/window datum, battery keepout, USB-C opening,
   rear button axes, bilateral RGB windows, strap bridge, and case split.
2. Put the selected ESP32-S3 module at the upper-right board edge. Copy the
   exact module land pattern, antenna overhang, and keepout from its current
   datasheet. `TODO: VERIFY`
3. Reserve the NFC perimeter loop, detouring around the BLE keepout, USB-C,
   bosses, and strap load path. Keep tuning links and measurement pads
   accessible. `TODO: VERIFY`
4. Place the display panel and FPC connector from the ordered drawing and
   measured sample. The FPC bend must not cross the BLE keepout, USB-C opening,
   rear case transition, or battery keepout. `TODO: VERIFY`
5. Place USB-C at the lower-right board edge with shell, plug, cable, case wall,
   ESD, CC resistors, and D+/D- return path reviewed as one mechanical/electrical
   dependency. `TODO: VERIFY`
6. Place charger, regulator, and high-current loops outside BLE/NFC regions and
   away from the pouch. Place local decoupling at the reviewed device pins.
7. Place three switches on the existing lower-rear horizontal axes. Preserve
   cap travel, case clearance, center-button differentiation, and boot-strap
   safety. `TODO: VERIFY`
8. Place side-emitting RGB LEDs against the left/right light-guide interfaces.
   The right guide and emitters must not violate the BLE keepout.
9. Reserve the piezo acoustic volume and port. Keep the optional vibration
   motor DNP unless its height, retention, stall current, EMI, and vibration
   coupling pass review.
10. Put bare pogo test pads where the fixture can reach them after assembly.
    Do not use pin headers in the thin product.

## Placement map

| Zone | Planned contents | Hard exclusions / dependencies |
|---|---|---|
| Upper front | 2.0 inch-class 240 x 320 display and clear window | No battery overlap; window, adhesive, active area, FPC datum, and viewing orientation `TODO: VERIFY` |
| Upper-right rear edge | ESP32-S3 module and antenna | Exact datasheet keepout; no NFC copper, display metal, battery, fastener, RGB metal, or case metal `TODO: VERIFY` |
| PCB perimeter | Dynamic-tag NFC loop | Detour around BLE keepout, USB-C, bosses, side LEDs, and strap load path; assembled tuning `TODO: VERIFY` |
| Display lower edge | FPC connector and bend zone | Contact side, insertion direction, actuator access, bend radius, and rear transition `TODO: VERIFY` |
| Lower rear center | Protected LiPo and expanded keepout | Include pouch seal, PCM/wires, insulation, adhesive, swelling, and service loop; avoid RF and hot parts `TODO: VERIFY` |
| Lower-right edge | USB-C, ESD, CC resistors | Case opening, shell stakes, plug insertion, cable clearance, and battery separation `TODO: VERIFY` |
| Lower rear row | Three buttons | Case cap axes, travel, force, clothing/table protection, and GPIO straps `TODO: VERIFY` |
| Left/right front edges | Side RGB emitters and light guides | Optical gap, leakage mask, LED direction, current/thermal budget, BLE keepout on right `TODO: VERIFY` |
| Rear acoustic zone | Piezo | Port, cavity, adhesive/land pattern, rear wall, and battery separation `TODO: VERIFY` |
| Rear optional zone | Vibration motor and driver | DNP by default; no RF, battery, FPC, or sensitive power coupling `TODO: VERIFY` |
| Fixture-facing rear | Bare test pads | Pogo access after case removal, fixture datum, short protection, no pin headers `TODO: VERIFY` |

## Cross-discipline release conditions

- Mechanical: reviewed STEP interference check using
  `mechanical/v1-envelope.json`.
- Electrical: human schematic review and ERC disposition.
- RF: exact BLE keepout and assembled NFC tuning plan reviewed.
- Manufacturing: exact footprints, rotations, side, DNP/manual state, and
  current JLCPCB/LCSC status checked.
- Regulatory: exact module or finished-product Japan radio certification
  applicability remains `TODO: VERIFY`; no automatic certification claim.
