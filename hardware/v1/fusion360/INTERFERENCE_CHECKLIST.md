# V1 Fusion 360 interference checklist

Status: CAD review checklist for the locked V1 envelope.

## Locked model setup

- Drive dimensions from `../mechanical/v1-envelope.json`.
- Product body remains nominal 49 x 99 mm including strap bridge.
- PCB remains 46 x 84 mm.
- Front face remains one flat datum.
- Display/body region remains 6.8 mm nominal.
- Lower LiPo region remains 8.5 mm maximum with rear-only depth.
- Enclosure remains transparent smoke resin for V1.
- Aluminum, metal strap hardware, magnets, and NFC reader/writer hardware remain out of V1.

## Components to model as separate bodies

| Body | Minimum model content |
|---|---|
| PCB | Board outline, thickness, mounting datum, connector side |
| Display | Panel outline, active/visible area, thickness, FPC tail, stiffener |
| Lens/window | Front resin/lens thickness, adhesive land, light/dust mask |
| Battery | Expanded keepout including pouch, PCM, wires, adhesive, swelling |
| USB-C | Receptacle shell, stakes, plug/cable insertion envelope |
| Buttons | Switch bodies, actuator travel, caps, rear wall clearance |
| RGB guides | Side emitters, optical gap, mask, transparent resin path |
| Piezo | Body, adhesive/land, acoustic cavity/port |
| Optional motor DNP | Reserved volume only until fit/noise/current review passes |
| BLE keepout | Exact no-copper/no-metal/no-component volume `TODO: VERIFY` |
| NFC loop/access | Perimeter loop corridor, tuning area, measurement access |
| Strap bridge | Integral resin bridge and shoulders outside PCB |

## Interference checks

- [ ] Display stack fits the 6.8 mm region with adhesive, FPC, connector, PCB, rear parts, insulation, and resin present.
- [ ] Battery stack fits the 8.5 mm lower rear region with swelling allowance and no sharp/hot/conductive contact.
- [ ] Display and expanded battery keepouts remain separated in XY.
- [ ] Rear-only 1.7 mm thickness transition does not create a front step.
- [ ] USB-C plug/cable path clears battery, case wall, and button row.
- [ ] Three rear button caps travel without contacting battery, PCB, switch neighbors, or table-protection recess.
- [ ] Side RGB guides remain symmetric and do not intrude into BLE keepout.
- [ ] BLE no-go volume is free of metal, copper, battery foil, display metal, connector shells, fasteners, labels/foils, and strap hardware.
- [ ] NFC loop corridor and tuning pads remain accessible and clear of bosses, USB-C shell, and strap shoulders.
- [ ] Strap bridge load path stays outside PCB outline and uses textile-only hardware.

## Evidence record template

```text
Fusion 360 interference review:
- CAD revision:
- PCB STEP revision:
- Envelope JSON revision:
- Display sample/drawing:
- Battery sample/drawing:
- BLE keepout source:
- Resin process:
- Interference tool/result:
- Screenshots/exports:
- Remaining TODO: VERIFY:
- Reviewer:
```
