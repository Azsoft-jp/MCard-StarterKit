# Fusion 360 handoff

Store versioned STEP/DXF handoff notes and exported neutral geometry here.
Do not commit proprietary cloud project data.

## V1 locked baseline

- Product: nominal 49 x 99 mm including integral resin strap bridge.
- PCB: 46 x 84 mm planning target, 0.8 mm preferred, 1.0 mm fallback.
- Front: single flat datum with a 2.0 inch-class 240 x 320 IPS TFT.
- Thickness: 6.8 mm LCD/body region; 8.5 mm lower LiPo region with rear-only depth.
- Enclosure: transparent smoke resin. Aluminum back cover is deferred.
- Top: resin strap bridge outside PCB; textile-only hardware.
- RF: ESP32-S3 module at board edge with exact antenna keepout; dynamic NFC perimeter loop only.

## Handoff checklist

1. Import the reviewed 46 x 84 mm PCB STEP as a referenced component.
2. Drive dimensions from `../mechanical/v1-envelope.json`; do not trace concept images.
3. Create separate components for PCB, display panel, display window/lens, FPC, battery keepout, rear button caps, side RGB light guides, USB-C opening, piezo cavity, strap bridge, upper case, and rear lower LiPo bulge.
4. Model the front as one continuous flat plane.
5. Put the 1.7 mm thickness increase on the rear lower LiPo region only.
6. Add explicit no-go volumes for the ESP32-S3 antenna keepout and NFC loop/tuning access.
7. Keep display and LiPo volumes separated in XY.
8. Keep aluminum, metal strap hardware, magnetic attachments, and NFC reader/writer hardware out of V1.
9. Export neutral STEP/DXF review files only. Do not commit proprietary Fusion cloud project data.

## Linked notes

- `../mechanical/envelope-notes.md`
- `../mechanical/display-window-notes.md`
- `../mechanical/battery-volume-notes.md`
- `../mechanical/button-clearance-notes.md`
- `../mechanical/antenna-keepout-notes.md`

## Open TODO: VERIFY items

- JLC3DP transparent smoke resin process, wall/rib/snap/boss limits, tolerances, cleanup, tint, UV aging, and light leakage.
- Display sample dimensions, adhesive/lens stack, FPC bend, connector height, and manual assembly sequence.
- Protected LiPo dimensions, PCM/wires, swelling, insulation, adhesive, strain relief, safety paperwork, and runtime.
- USB-C plug/cable insertion volume, rear button reach/travel, side RGB optical coupling, and piezo acoustic path.
- Exact ESP32-S3 antenna keepout and assembled NFC tuning after case and component geometry are present.
