# V1 mechanical stack-up

This is planning budget, not released tolerance analysis. Every source
dimension adhesive/assembly allowance remains `TODO: VERIFY` against
selected part drawing, measured sample, resin process.

## Locked geometry

- Nominal product: 49 x 99 mm including resin strap bridge.
- PCB: 46 x 84 mm.
- PCB thickness: 0.8 mm target; 1.0 mm fallback only after fit, flex, impedance, JLCPCB availability review.
- Front: one continuous flat datum.
- Upper LCD/body region: 6.8 mm nominal.
- Lower LiPo region: 8.5 mm maximum, added depth on rear only.
- Display expanded battery keepout do not overlap in XY.

## Regional budgets

| Region | Stack contributors | Release condition |
|---|---|---|
| Upper display | Front lens/resin, optical adhesive, TFT glass/frame, FPC/stiffener, PCB, ESP32-S3 module other rear components, insulation, rear resin, assembly clearance | Measured sum fits 6.8 mm tolerances; module shield display backing do not violate BLE keepout `TODO: VERIFY` |
| Lower battery | Flat front resin, PCB low components, insulation, protected LiPo including seal/PCM/wires, adhesive, swelling allowance, rear resin, assembly clearance | Worst-case sum fits 8.5 mm; pouch has no sharp/hot/metal contact `TODO: VERIFY` |
| USB-C opening | Receptacle shell, PCB datum, solder/stakes, case wall, plug overmold, insertion/removal path | Exact connector drawing physical sample fit lower-right opening `TODO: VERIFY` |
| Button row | Switch body, actuator travel, cap, membrane/light seal if used, rear wall, tolerance | Three caps remain reachable protected accidental actuation `TODO: VERIFY` |
| RGB edges | Side emitter, solder, optical gap, diffuser/light guide, mask, side wall | Bilateral output is visible without excessive leakage or BLE keepout intrusion `TODO: VERIFY` |
| Piezo | Land/adhesive, transducer body, acoustic cavity/port, rear wall | Acoustic volume and 8.5 mm envelope pass sample test `TODO: VERIFY` |
| Optional vibration | Driver parts, wire pads, motor body, adhesive, wire bend, rear wall | DNP unless thickness, retention, noise, EMI, pouch/display coupling pass `TODO: VERIFY` |

## Mechanical safety rules

- No display-over-battery stacking.
- No pin headers. Use bare ENIG pogo pads verified low-profile test points.
- No metal back cover in V1.
- No PCB strap slot metal eyelet in V1.
- No sharp solder, exposed conductive edges, hot charger/regulator parts, or replaceable fasteners against LiPo.
- Keep battery, display metal, connector shells, fasteners, light-guide metal, motor mass outside exact BLE antenna keepout.
- Treat NFC tuning as assembled-product measurement with display, battery, PCB copper, and resin case present.

## Display, NFC, and antenna stack details

| Feature | Stack-up dependency | Release condition |
|---|---|---|
| 2.0 inch-class IPS TFT | Front resin/lens, adhesive, display glass/frame, FPC stiffener, folded tail, 14-pin connector, PCB, rear parts, rear resin | Worst-case measured stack fits 6.8 mm display/body region and keeps the front datum flat `TODO: VERIFY` |
| Display window | Active area, visible area, adhesive land, dust/light mask, resin window, internal ribs | Window does not crowd side RGB guides, strap bridge shoulder, BLE keepout, or display FPC bend `TODO: VERIFY` |
| Protected 402025-class LiPo | Pouch, PCM, wire exit, connector or solder pads, insulation, adhesive, swelling allowance, rear resin | Expanded keepout remains below display keepout and fits 8.5 mm rear-only lower region `TODO: VERIFY` |
| ST25DV dynamic tag | Tag IC package, decoupling, I2C pull-ups, field-detect routing, loop feed, tuning footprints | Tag/tuning access does not violate BLE keepout or mechanical bosses; exact package/pinout verified `TODO: VERIFY` |
| Board-edge NFC loop | PCB perimeter copper, matching pads, measurement pads, case ribs, strap shoulders, USB-C opening, RGB windows | Assembled product tuning plan exists; aluminum remains deferred `TODO: VERIFY` |
| ESP32-S3 antenna | Module body, antenna overhang, no-copper/no-metal region, resin wall, display backing, NFC copper | Exact selected-module keepout imported into KiCad and Fusion 360 before layout release `TODO: VERIFY` |

## Fusion 360 handoff dimensions

- Drive CAD from `mechanical/v1-envelope.json`; do not trace the concept image.
- Model upper display/body region at 6.8 mm nominal external thickness.
- Model lower LiPo region at 8.5 mm maximum external thickness with the 1.7 mm transition on the rear only.
- Keep the product body uniformly 49 mm wide with straight aligned sides through the display and LiPo regions.
- Keep the strap bridge integral resin outside the PCB outline, with textile-only hardware and no PCB slot or metal eyelet.
- Add explicit no-go volumes for the BLE antenna keepout and NFC loop/tuning access.
- Keep aluminum back cover, metal strap fittings, magnetic attachments, and reader/writer NFC hardware out of V1.
