# V1 RF and NFC measurement checklist

Status: prototype measurement plan. This does not claim BLE, NFC, or regulatory
compliance.

## Scope

- BLE antenna placement review for the selected ESP32-S3 module.
- Dynamic NFC tag loop bring-up and assembled tuning.
- Coexistence review with display, protected LiPo, USB-C shell, resin case,
  side RGB light guides, rear buttons, piezo, optional motor DNP, and strap
  bridge present.

## Preconditions

- Exact ESP32-S3 module MPN and datasheet keepout copied into KiCad and Fusion 360.
- NFC tag IC selected: ST25DV preferred or NTAG I2C fallback.
- NFC matching/tuning footprints, 0 ohm links, and measurement pads present.
- Display panel, battery, USB-C, case resin, and strap bridge mechanical samples installed or represented by measured substitutes.
- No aluminum back, metal strap hardware, magnets, or metal labels in V1 test article.

## BLE review steps

| Step | Evidence to capture | Pass condition |
|---|---|---|
| Datasheet overlay | Screenshot/export showing exact keepout over PCB and CAD | No copper, ground, components, display metal, battery metal, fastener, or NFC copper enters keepout |
| Board-edge orientation | PCB render or photo with antenna facing edge/free space | Antenna orientation matches selected module guidance `TODO: VERIFY` |
| Assembled no-metal check | CAD section and prototype photo | Resin-only local enclosure, textile-only strap hardware, no metal intrusion |
| Functional smoke test | Local BLE advertising/connection log using sample UUIDs | Deterministic local test passes without cloud dependency |
| Regulatory note | Review record | No Japan radio certification claim until exact module/product applicability is verified |

## NFC bring-up steps

| Step | Evidence to capture | Pass condition |
|---|---|---|
| Loop continuity | DMM or fixture record | Loop and tuning links match schematic/layout intent |
| Initial resonance scan | VNA/reader fixture record | Resonance is measurable and tunable; values remain `TODO: VERIFY` until reviewed |
| Tag I2C identity | Local firmware log | Host can read selected dynamic tag identity/registers using public-safe code |
| Passive field response | Reader log with synthetic payload | Tag is readable with no proprietary data or official compatibility claim |
| Assembled retune | Measurement with display, battery, resin case, USB-C shell, and strap bridge installed | Matching values recorded for assembled product, not bare PCB only |

## Clean-room test data

- Use neutral public-safe tag records and synthetic payloads only.
- Do not use captured app traffic, official assets, nonlocal service URLs, private IDs, or proprietary command maps.
- Do not include real firmware update images or flashing behavior.

## Result record template

```text
RF/NFC measurement record:
- Prototype ID:
- PCB revision:
- Case revision:
- Display sample:
- Battery sample:
- ESP32-S3 module:
- Dynamic tag IC:
- NFC tuning population:
- BLE keepout reviewed by:
- NFC measurement equipment:
- Reader/test fixture:
- Result:
- Remaining TODO: VERIFY:
```
