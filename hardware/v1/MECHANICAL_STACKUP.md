# V1 mechanical stack-up

This is a planning budget, not a released tolerance analysis. Every source
dimension and adhesive/assembly allowance remains `TODO: VERIFY` against the
selected part drawing, measured sample, and resin process.

## Locked geometry

- Nominal product: 49 x 99 mm including the resin strap bridge.
- PCB: 46 x 84 mm.
- PCB thickness: 0.8 mm target; 1.0 mm fallback only after fit, flex, impedance,
  and JLCPCB availability review.
- Front: one continuous flat datum.
- Upper LCD/body region: 6.8 mm nominal.
- Lower LiPo region: 8.5 mm maximum, with added depth on the rear only.
- Display and expanded battery keepout do not overlap in XY.

## Regional budgets

| Region | Stack contributors | Release condition |
|---|---|---|
| Upper display | Front lens/resin, optical adhesive, TFT glass/frame, FPC/stiffener, PCB, ESP32-S3 module or other rear components, insulation, rear resin, assembly clearance | Measured sum fits 6.8 mm with tolerances; module shield and display backing do not violate BLE keepout `TODO: VERIFY` |
| Lower battery | Flat front resin, PCB and low components, insulation, protected LiPo including seal/PCM/wires, adhesive, swelling allowance, rear resin, assembly clearance | Worst-case sum fits 8.5 mm; pouch has no sharp/hot/metal contact `TODO: VERIFY` |
| USB-C opening | Receptacle shell, PCB datum, solder/stakes, case wall, plug overmold, insertion/removal path | Exact connector drawing and physical sample fit the lower-right opening `TODO: VERIFY` |
| Button row | Switch body, actuator travel, cap, membrane/light seal if used, rear wall, tolerance | Three caps remain reachable and protected from accidental actuation `TODO: VERIFY` |
| RGB edges | Side emitter, solder, optical gap, diffuser/light guide, mask, side wall | Bilateral output is visible without excessive leakage or BLE keepout intrusion `TODO: VERIFY` |
| Piezo | Land/adhesive, transducer body, acoustic cavity/port, rear wall | Acoustic volume and 8.5 mm envelope pass sample test `TODO: VERIFY` |
| Optional vibration | Driver parts, wire pads, motor body, adhesive, wire bend, rear wall | DNP unless thickness, retention, noise, EMI, and pouch/display coupling pass `TODO: VERIFY` |

## Mechanical safety rules

- No display-over-battery stacking.
- No pin headers. Use bare ENIG pogo pads or verified low-profile test points.
- No metal back cover in V1.
- No PCB strap slot or metal eyelet in V1.
- No sharp solder, exposed conductive edges, hot charger/regulator parts, or
  replaceable fasteners against the LiPo.
- Keep battery, display metal, connector shells, fasteners, light-guide metal,
  and motor mass outside the exact BLE antenna keepout.
- Treat NFC tuning as an assembled-product measurement with display, battery,
  PCB copper, and resin case present.
