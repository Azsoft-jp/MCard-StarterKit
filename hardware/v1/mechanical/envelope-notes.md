# V1 envelope notes

Status: notes for the machine-readable envelope in `v1-envelope.json`.

## Locked dimensions

| Item | Locked V1 planning value |
|---|---:|
| Product width | 49 mm nominal |
| Product height including strap bridge | 99 mm nominal |
| PCB width | 46 mm |
| PCB height | 84 mm |
| PCB thickness | 0.8 mm preferred, 1.0 mm fallback |
| Display/body region thickness | 6.8 mm nominal |
| Lower LiPo region thickness | 8.5 mm maximum |

## Envelope rules

- The front exterior is one continuous flat datum.
- The 1.7 mm depth increase appears on the rear lower LiPo region only.
- Display and LiPo keepouts remain separated in XY.
- Body width remains uniform; do not introduce a wider lower section, waist, or tapered battery pod.
- Strap bridge is transparent smoke resin outside the PCB outline.
- No aluminum rear cover, metal strap eyelet, or NFC reader/writer hardware is allowed in V1.

## CAD handoff

- Treat `v1-envelope.json` as the source of planning coordinates.
- Keep `v1-floorplan.svg` and `v1-stackup.svg` as visual aids only.
- Update the validator and review notes with any coordinate change.
- Preserve the locked baseline unless an explicit mechanical change request updates the machine-readable envelope.

## Open TODO: VERIFY items

- Resin process wall/rib limits, shrinkage, clearances, snap/boss geometry, and cleanup needs.
- Exact display panel, lens/adhesive, FPC, connector, battery, USB-C, switch, light-guide, piezo, and optional motor dimensions.
- Exact ESP32-S3 antenna no-go volume and NFC tuning access volume in CAD.
- Strap bridge pull, torsion, fatigue, drop, textile strap abrasion, and UV aging acceptance criteria.
