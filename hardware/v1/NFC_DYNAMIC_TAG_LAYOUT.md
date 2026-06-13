# V1 dynamic NFC tag layout

Status: dynamic-tag planning note. This is not an RF release.

## Locked baseline

- V1 uses a dynamic NFC tag only: I2C host plus passive 13.56 MHz NFC interface.
- V1 does not include an NFC reader/writer function.
- Preferred IC direction: ST25DV dynamic tag family, current BOM direction `ST25DV04KC-IE6S3`.
- Fallback IC direction: NXP NTAG I2C plus, current BOM direction `NT3H2111W0FHKH`.
- NFC antenna direction: perimeter PCB loop on the 46 x 84 mm board.
- Enclosure near the NFC loop remains transparent smoke resin. Aluminum is deferred.

## Layout intent

| Area | V1 rule | Verification gate |
|---|---|---|
| NFC loop | Board-edge perimeter loop, interrupted or detoured where needed | `TODO: VERIFY` loop geometry, inductance, Q, tuning range |
| BLE coexistence | NFC copper must stay outside the exact ESP32-S3 module antenna keepout | `TODO: VERIFY` selected module datasheet keepout copied into KiCad |
| Tuning | Place series/shunt tuning footprints, 0 ohm links, and measurement pads | `TODO: VERIFY` topology against selected ST/NXP application notes |
| Tag IC | Keep near loop feed and I2C host routing, without crowding RF keepouts | `TODO: VERIFY` pinout, package, exposed pad, GPO/FD wiring |
| Assembly | Keep antenna and tuning access clear of bosses, USB-C shell, buttons, side LEDs, and strap load path | `TODO: VERIFY` assembled-product measurement plan |

## Preferred ST25DV path

- Use ST25DV as the preferred V1 dynamic-tag direction because the SO-8 package is easier to inspect and rework during early prototypes.
- Keep energy-harvest, GPO/field-detect, write-protect, and pull-up choices unfrozen until the exact order code and schematic review are complete.
- Treat ST application-note antenna values as a starting point only. The transparent resin, display, battery, copper pours, USB shell, and strap bridge geometry require assembled tuning.

## NTAG I2C fallback path

- NTAG I2C plus remains a fallback, not a drop-in replacement.
- The fallback changes package, pinout, memory map, field-detect behavior, firmware driver, and antenna tuning assumptions.
- Do not share footprints or firmware constants between ST25DV and NTAG I2C unless a deliberate adapter layer is reviewed.

## Clean-room and safety notes

- Use neutral public-safe protocol names and synthetic test payloads only.
- Do not include official app assets, captured app code, HAR data, vendor cloud endpoints, or proprietary command maps.
- Do not claim official compatibility or real-product NFC behavior.
- ngspice cannot validate NFC antenna performance; use it only for low-frequency or lumped sanity checks if documented.

## Open TODO: VERIFY items

- Exact ST25DV order suffix, package pinout, EEPROM size, I2C address behavior, GPO/FD use, power/decoupling, and LCSC/JLCPCB assembly status.
- Exact NTAG I2C fallback order code, XQFN footprint, exposed-pad handling, address behavior, and lifecycle.
- Loop width/spacing, corner treatment, via count, ground clearance, matching network, capacitor range, and fixture access.
- Assembled tuning with display, battery, PCB copper, resin case, USB-C shell, strap bridge, and side light guides present.
- Reader interoperability test method, acceptance limits, field orientation, and pass/fail record.
