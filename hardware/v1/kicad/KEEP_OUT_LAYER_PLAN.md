# V1 KiCad keepout and drawing layer plan

Status: KiCad layout handoff plan. This does not replace exact datasheet
footprints, courtyards, or human layout review.

## Required visible regions

| Region | KiCad representation | Source |
|---|---|---|
| Board outline | `Edge.Cuts` 46 x 84 mm planning outline | `mechanical/v1-envelope.json` |
| Product body reference | User drawing layer, non-fabrication | 49 x 99 mm product envelope including strap bridge |
| Display panel | Courtyard/drawing rectangle plus FPC bend reference | Selected display drawing `TODO: VERIFY` |
| Display clear window | User drawing layer | Selected display active/visible area `TODO: VERIFY` |
| Protected LiPo keepout | User drawing plus component keepout | Exact cell/PCM/wire sample `TODO: VERIFY` |
| USB-C insertion volume | User drawing layer from right edge | Exact connector and plug samples `TODO: VERIFY` |
| Rear button row | User drawing layer and switch courtyards | Exact switch/cap geometry `TODO: VERIFY` |
| Side RGB guides | User drawing layer on left/right edges | Light-guide CAD and LED drawing `TODO: VERIFY` |
| BLE antenna keepout | Copper/component/zone keepout plus drawing label | Exact ESP32-S3 module datasheet `TODO: VERIFY` |
| NFC loop keepout/access | Copper loop corridor, matching pads, measurement access | Selected ST/NXP antenna guidance and measurement plan |
| Strap bridge shoulders | User drawing layer outside PCB outline | Fusion 360 case model `TODO: VERIFY` |

## Layer naming guidance

- Use fabrication layers only for board-manufacturing geometry.
- Put enclosure, display window, battery, button caps, light guides, and strap bridge references on user drawing layers.
- Put RF/no-metal notes directly near the affected region so they survive export review.
- Keep exact BLE antenna keepout as enforceable copper/component/zone restrictions, not only text.

## Review checklist

- [ ] Exact ESP32-S3 module keepout is copied from the selected datasheet.
- [ ] NFC loop does not enter BLE keepout.
- [ ] Display metal and FPC stiffener do not enter BLE keepout.
- [ ] Battery expanded keepout does not overlap display keepout.
- [ ] USB-C insertion volume does not overlap battery keepout.
- [ ] Rear buttons sit below battery keepout.
- [ ] Side RGB hardware does not intrude into BLE keepout.
- [ ] Tuning pads and measurement access remain reachable after assembly.
- [ ] Every `TODO: VERIFY` geometry source is named in the layout review notes.
