# KiCad placement dependencies

These constraints must be resolved before symbols and footprints are promoted
from the generated PR-3 scaffold into a layout candidate.

| Schematic block | Placement dependency | Blocking verification |
|---|---|---|
| ESP32-S3 module | Upper-right PCB edge; antenna faces outward | `TODO: VERIFY` exact module land pattern, overhang, keepout, height, straps, and Japan certification applicability |
| Dynamic NFC tag | Connects to a perimeter loop that detours around BLE, USB-C, bosses, LEDs, and strap load path | `TODO: VERIFY` loop geometry, tuning topology, measurement access, and assembled performance |
| TFT and FPC | Upper-front display; connector near display lower edge | `TODO: VERIFY` tail datum, contact side, insertion direction, bend radius, backlight pins, and no BLE/USB/battery conflict |
| LiPo and connector | Lower-rear expanded keepout, separate from display | `TODO: VERIFY` exact cell, seal, PCM/wires, swelling, insulation, adhesive, cable exit, and polarity |
| USB-C and ESD | Lower-right board edge aligned to case opening | `TODO: VERIFY` shell/stake footprint, plug insertion volume, case wall, D+/D- path, and battery gap |
| Buttons | Existing three lower-rear horizontal axes | `TODO: VERIFY` switch direction/height, cap travel, force, accessibility, and strap-safe GPIO assignment |
| RGB LEDs | Left/right front edges coupled to light guides | `TODO: VERIFY` emission direction, optical gap, masking, current budget, and right-side BLE clearance |
| Piezo | Reserved rear acoustic zone | `TODO: VERIFY` body height, land pattern, cavity, port, and rear wall |
| Optional vibration | DNP footprint/pads in reviewed rear zone | `TODO: VERIFY` motor MPN, height, retention, stall current, clamp, EMI, and vibration coupling |
| Test pads | Rear fixture-facing surface after case removal | `TODO: VERIFY` pad diameter/pitch, fixture datum, probe current, exposed-copper protection, and signal-integrity impact |

## Non-negotiable baseline

- Keep the nominal 49 x 99 mm product, 46 x 84 mm PCB, and upper-display /
  lower-battery separation.
- Keep the upper display and lower rear LiPo placement.
- Keep the 0.8 mm PCB target and 1.0 mm fallback.
- Keep the flat front and rear-only 6.8/8.5 mm thickness transition.
- Use no pin headers in the finished thin product.
- Generated KiCad files require human electrical review and are not
  electrically verified or approved for fabrication.
