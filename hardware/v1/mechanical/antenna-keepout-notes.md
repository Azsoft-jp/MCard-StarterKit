# V1 antenna keepout notes

Status: CAD no-go-volume handoff for BLE and NFC.

## BLE no-go volume

- Place the ESP32-S3 module at a board edge.
- Copy the exact selected-module antenna keepout from the official datasheet into KiCad and Fusion 360.
- Keep copper, traces, vias, ground pours, NFC loop copper, display metal, battery foil, USB shell, fasteners, RGB leadframes, buzzer/motor metal, labels/foils, and strap hardware out of the no-go volume unless the datasheet explicitly permits them.
- Keep V1 enclosure material near the antenna as resin; do not add aluminum or metal strap fittings.

## NFC no-go and access volume

- Reserve board-edge loop clearance and tuning access around the perimeter.
- Detour around the BLE keepout, USB-C opening, bosses, strap bridge shoulders, and side light-guide hardware.
- Keep matching capacitors, 0 ohm links, and measurement pads accessible for prototype tuning.
- Treat assembled product tuning as mandatory because display, battery, copper, USB shell, resin, and strap geometry affect the loop.

## Open TODO: VERIFY items

- Exact BLE keepout dimensions, antenna overhang, module orientation, ground clearance, and board-edge placement.
- Exact NFC loop geometry, matching topology, capacitor range, VNA/reader test fixture, and acceptance limits.
- Fusion 360 no-go-volume import and interference check against display, LiPo, USB-C, rear buttons, RGB guides, piezo, optional motor, and strap bridge.
- Japan radio-certification applicability for the exact module and finished product.
