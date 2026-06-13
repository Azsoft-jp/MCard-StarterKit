# V1 display selection notes

Status: planning target, not a released source-control drawing.

## Locked baseline

- Product envelope: nominal 49 x 99 mm including the resin strap bridge.
- PCB planning target: 46 x 84 mm, 0.8 mm preferred, 1.0 mm fallback only after review.
- Display target: 2.0 inch-class 240 x 320 portrait IPS TFT on the flat front.
- Display region thickness: 6.8 mm nominal external body region.
- Battery region thickness: 8.5 mm maximum external lower rear LiPo region.
- Display and protected LiPo keepouts remain separated in XY. No display-over-battery stack.

## Preferred panel direction

| Item | Planning direction | Verification gate |
|---|---|---|
| Class | 2.0 inch IPS TFT per local ER-TFT020-3 PDF conversion | `TODO: VERIFY` ordered sample |
| Resolution | 240 x 320 portrait per local ER-TFT020-3 PDF conversion | `TODO: VERIFY` controller init, color order, rotation |
| Interface | SPI display, current BOM direction uses ST7789-class panel | `TODO: VERIFY` exact pinout, reset, backlight pins, signal limits |
| Candidate | EastRising ER-TFT020-3 Rev 1.0 preliminary release dated 2023-12-18 from local PDF conversion | `TODO: VERIFY` lifecycle, manual assembly path |
| Planning panel envelope | 34.60 x 47.80 x 2.0 mm with FPC folded per local PDF conversion | `TODO: VERIFY` measured glass, frame, adhesive, FPC stiffener, tail |
| Connector | 14-position 0.5 mm FPC direction | `TODO: VERIFY` contact side, FPC thickness, latch access, mated height |

## Local PDF evidence

`/root/ER-TFT020-3_Datasheet.pdf` was converted to
`/tmp/mcard-pdf-md/ER-TFT020-3_Datasheet.md` with docling on 2026-06-13.
The converted PDF supports the current display candidate, 240 x 320 format,
ST7789 controller direction, 4-wire serial SPI, 34.60 x 47.80 x 2.0 mm folded
outline, 31.60 x 41.80 mm visual area, 30.60 x 40.80 mm active area, VDD
2.5-3.3 V, IOVDD 1.8-3.3 V, and backlight planning values. The full Markdown
conversion is not committed.

## Mechanical placement rules

- Keep the display clear window in the upper front zone, referenced to the single flat front datum.
- Keep the display expanded keepout above the lower LiPo keepout; current machine-readable envelope keeps a 2.0 mm planning gap.
- Do not let display metal, FPC stiffener, connector shell, adhesive carrier, or retaining tape enter the exact ESP32-S3 antenna keepout.
- Route the FPC bend path away from the BLE antenna keepout, USB-C opening, rear battery bulge transition, and button cap travel.
- Confirm that display connector height, folded tail, adhesive, front resin/lens, PCB, rear parts, insulation, and rear resin fit inside the 6.8 mm display/body region.
- Keep display inspection and replacement assumptions realistic: panel is off-board/manual assembly unless a verified PCBA process says otherwise.

## Electrical and firmware notes

- Backlight voltage and current are panel-specific. Do not freeze resistor, MOSFET, or boost-driver values until the ordered drawing and sample are checked.
- The display driver sequence must remain profile-driven by selected panel/controller. Do not encode proprietary app behavior or official assets.
- Add test firmware only with synthetic/public-safe images and deterministic display bring-up patterns.

## Open TODO: VERIFY items

- Supplier drawing revision, panel thickness, visible area, active area, cover/lens overlap, and viewing orientation.
- FPC pin order, exposed-contact side, FPC thickness, stiffener length, bend radius, and connector courtyard.
- Backlight string voltage/current, dimming topology, current limit, EMI, thermal rise, and sleep leakage.
- Manual installation process, adhesive stack, optical gap, dust control, serviceability, and yield risk.
- Interference with ESP32-S3 antenna keepout, NFC loop, RGB light guides, USB-C insertion volume, and lower rear LiPo bulge.
