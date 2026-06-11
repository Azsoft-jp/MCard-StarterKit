# V1 risk register

| ID | Risk | Impact | Mitigation / gate |
|---|---|---|---|
| R1 | BLE keepout violated by PCB, battery, display, or case | Range/compliance failure | Exact module rule plus RF layout review |
| R2 | NFC loop detuned by battery/display/copper | Poor tag operation | Tuning pads, prototypes, measured L/Q, RF review |
| R3 | 8.5 mm stack exceeded | Enclosure redesign | Freeze measured component stack before layout |
| R4 | Charger/regulator overheats | Battery/product hazard | Thermal calculation and worst-case bench test |
| R5 | ESP32-S3 peak current collapses 3V3 | resets/display artifacts | Power budget, load-step analysis, measurement |
| R6 | Wrong strap/USB/debug pin assignment | Cannot boot/program | Datasheet checklist and schematic review |
| R7 | TFT FPC pinout/driver changes | Re-spin | Exact display drawing/sample before schematic gate |
| R8 | LCSC stock/lifecycle changes | Delay/cost | Alternates and re-check at BOM/pre-order gates |
| R9 | CPL rotation or footprint error | Misassembled board | Datasheet + JLC preview inspection |
| R10 | Resin tolerances/warpage | Poor fit | Coupons, allowance, JLC3DP process review |
| R11 | Japan radio certification assumed | Illegal operation risk | Exact certification applicability gate |
| R12 | Generator output treated as verified | Electrical/manufacturing defect | Human ERC/DRC and discipline reviews |
