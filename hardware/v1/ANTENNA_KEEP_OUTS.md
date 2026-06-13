# V1 antenna keep-outs

Status: RF planning constraints. Exact keepouts remain datasheet-controlled.

## Locked baseline

- ESP32-S3 module sits at a board edge; exact antenna keepout is mandatory.
- NFC uses a dynamic-tag perimeter loop on the 46 x 84 mm board.
- The V1 enclosure is transparent smoke resin. Aluminum and other metal rear cases are deferred.
- The display, protected LiPo, USB-C shell, RGB light guides, strap bridge, fasteners, and case features must be reviewed as an assembled stack.

## BLE keepout

| Constraint | Rule |
|---|---|
| Source of truth | Selected ESP32-S3 module datasheet and hardware design guide |
| Planning location | Upper-right rear board edge per `mechanical/v1-envelope.json` |
| Copper | No copper, ground pour, traces, vias, or NFC loop inside exact keepout unless datasheet explicitly permits |
| Components | No battery, display metal, connector shell, switch metal, LED leadframe, buzzer, motor, tuning part, fastener, or test pad inside exact keepout |
| Enclosure | Resin only by default near antenna; no metal pigment, ring, clip, eyelet, screw, magnet, or aluminum cover in V1 |
| Documentation | Copy the exact selected-module keepout into KiCad drawings and Fusion 360 no-go volumes |

`TODO: VERIFY` the current planning rectangle is conservative only. Replace it with the exact Espressif module keepout before layout release.

## NFC keepout and routing

- Reserve a board-edge NFC loop that detours around the BLE keepout, USB-C opening, mounting features, strap bridge load shoulders, and side light-guide hardware.
- Keep copper pours, battery foil, display frame/stiffener, USB shell, and future metal accessories away from the loop unless included in the assembled tuning plan.
- Keep matching parts and measurement pads accessible after PCBA and before final enclosure closure.
- Do not place the NFC loop under a metal back case; V1 uses resin and defers aluminum.

## Coexistence rules

- BLE and NFC keepouts are both mechanical and electrical constraints; they must be visible in schematic notes, PCB drawings, and Fusion 360.
- Do not use ngspice as proof of RF/NFC performance.
- Do not claim Japan radio compliance from the SoC or module choice alone. Exact module and finished-product applicability remain `TODO: VERIFY`.
- Any future envelope change must update `mechanical/v1-envelope.json`, placement notes, review records, and the validator before layout release.

## Open TODO: VERIFY items

- Exact ESP32-S3 module MPN, module revision, land pattern, antenna overhang, no-copper region, ground clearance, and enclosure clearance.
- Exact no-metal volume imported into Fusion 360 and checked against display, battery, USB-C, buttons, RGB guides, piezo, motor DNP, and strap bridge.
- NFC loop coexistence spacing from BLE antenna, tuning network values, measurement method, and assembled reader test.
- Resin tint/material RF impact, metal pigment exclusion, labels/foils/adhesives, and strap hardware material.
- Japan radio-certification applicability for the exact module and finished product.
