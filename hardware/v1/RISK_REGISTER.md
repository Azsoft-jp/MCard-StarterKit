# V1 risk register

| ID | Risk | Impact | Mitigation / gate |
|---|---|---|---|
| R1 | BLE keepout violated by PCB, battery, display, or case | Range/compliance failure | Exact module rule plus RF layout review |
| R2 | NFC loop detuned by battery/display/copper | Poor tag operation | Tuning pads, prototypes, measured L/Q, RF review |
| R3 | 6.8 mm LCD stack or 8.5 mm LiPo stack exceeded | Enclosure redesign | Freeze measured regional stacks before layout |
| R4 | Charger/regulator overheats | Battery/product hazard | Thermal calculation and worst-case bench test |
| R5 | ESP32-S3 peak current collapses 3V3 | resets/display artifacts | Power budget, load-step analysis, measurement |
| R6 | Wrong boot-strap GPIO/USB/debug pin assignment | Cannot boot/program | Datasheet checklist and schematic review |
| R7 | TFT FPC pinout/driver changes | Re-spin | Exact display drawing/sample before schematic gate |
| R8 | LCSC stock/lifecycle changes | Delay/cost | Alternates and re-check at BOM/pre-order gates |
| R9 | CPL rotation or footprint error | Misassembled board | Datasheet + JLC preview inspection |
| R10 | Resin tolerances/warpage | Poor fit | Coupons, allowance, JLC3DP process review |
| R11 | Japan radio certification assumed | Illegal operation risk | Exact certification applicability gate |
| R12 | Generator output treated as verified | Electrical/manufacturing defect | Human ERC/DRC and discipline reviews |
| R13 | Resin strap bridge cracks or transfers load into PCB/display | Drop or loss of product | Integral shoulders, radii, pull/fatigue/drop tests, no PCB hole |
| R14 | Metal strap fitting or load shoulder enters antenna region | BLE/NFC degradation | Textile-only V1 strap and RF/mechanical keepout review |
| R15 | Transparent resin leaks RGB/backlight or exposes visually poor/unsafe internals | Poor appearance or insulation concern | Opaque masks, controlled tint, insulation, optical coupon and UV-aging review |
| R16 | Rear lower buttons actuate against clothing or a table | Unintended input | Recessed caps, force/travel selection and wear/use testing |
| R17 | 46 x 84 mm PCB revision changes NFC loop and BLE coupling | RF regression | Re-run loop estimate, tuning plan and BLE/NFC review after layout |
| R18 | A later initialization prompt silently replaces the accepted envelope | Mechanical/RF documentation divergence | Validator locks 49 x 99 mm product, 46 x 84 mm PCB, and upper-display/lower-battery separation |
