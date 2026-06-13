# Display, NFC, antenna, and mechanical review

## Review status

- Stage: PR-05 V1 display, NFC, antenna, and mechanical detail.
- Baseline: locked 49 x 99 mm product, 46 x 84 mm PCB, separated upper display and lower rear LiPo.
- Result: CONDITIONAL / HUMAN MECHANICAL, RF, AND SOURCE REVIEW REQUIRED.

## Locked envelope confirmation

- Product remains nominal 49 x 99 mm including strap bridge.
- PCB remains 46 x 84 mm with 0.8 mm preferred thickness and 1.0 mm fallback.
- Front remains a single flat datum.
- Display/body region remains 6.8 mm nominal.
- Lower LiPo region remains 8.5 mm maximum with rear-only depth.
- Display and protected LiPo keepouts remain separated in XY.
- Enclosure remains transparent smoke resin; aluminum remains deferred.
- NFC remains dynamic tag only; no reader/writer function is added.

## Evidence added

- `DISPLAY_SELECTION_NOTES.md`
- `NFC_DYNAMIC_TAG_LAYOUT.md`
- `ANTENNA_KEEP_OUTS.md`
- `RF_NFC_MEASUREMENT_CHECKLIST.md`
- `MECHANICAL_STACKUP.md`
- `fusion360/README.md`
- `fusion360/INTERFERENCE_CHECKLIST.md`
- `mechanical/envelope-notes.md`
- `mechanical/display-window-notes.md`
- `mechanical/battery-volume-notes.md`
- `mechanical/button-clearance-notes.md`
- `mechanical/antenna-keepout-notes.md`
- `kicad/KEEP_OUT_LAYER_PLAN.md`
- `research/SOURCE_VERIFICATION_CHECKLIST.md`

## Safety and clean-room notes

- No official device firmware, binary update images, app assets, captured code, HTTP archive data, nonlocal service URLs, or proprietary command maps are introduced.
- Notes use public-safe generic behavior, neutral dynamic-tag language, and V1 planning constraints only.
- ST25DV is preferred and NTAG I2C is fallback, but exact order code, pinout, package, and antenna tuning remain `TODO: VERIFY`.
- BLE operation in Japan is not claimed certified. Exact module and finished-product certification applicability remain `TODO: VERIFY`.
- ngspice is not used as RF/NFC proof.

## Open TODO: VERIFY list

- Display supplier drawing, sample dimensions, FPC pinout, connector contact side, backlight voltage/current, adhesive/lens stack, lifecycle, and manual assembly.
- Exact ESP32-S3 module land pattern, antenna keepout, no-metal volume, GPIO/strap allocation, and Japan radio-certification applicability.
- ST25DV order suffix, package pinout, energy-harvest/GPO choices, I2C address behavior, LCSC/JLCPCB assembly status, and dynamic-tag firmware driver.
- NTAG I2C fallback package/pinout, firmware delta, and antenna retuning impact.
- NFC loop geometry, matching topology, capacitor range, measurement fixture, assembled tuning, reader interoperability, and pass/fail limits.
- Protected LiPo supplier, PCM/wires, polarity, swelling allowance, insulation, adhesive, charge current, thermal rise, safety paperwork, and runtime.
- Fusion 360 interference check for display, battery, USB-C, rear buttons, side RGB guides, piezo, optional motor DNP, strap bridge, BLE keepout, and NFC loop.
- JLC3DP transparent smoke resin wall/rib/snap/boss limits, tolerance, cleanup, optical behavior, UV aging, and light leakage.

## Follow-up tasks

- Import exact display, battery, connector, switch, and module dimensions into `mechanical/v1-envelope.json` after source verification.
- Implement KiCad courtyard and drawing layers from `kicad/KEEP_OUT_LAYER_PLAN.md` after exact source dimensions are verified.
- Execute the assembled-case RF/NFC measurement checklist when prototype hardware exists.
- Fill `research/SOURCE_VERIFICATION_CHECKLIST.md` records when official drawings/datasheets are rechecked before layout release.
