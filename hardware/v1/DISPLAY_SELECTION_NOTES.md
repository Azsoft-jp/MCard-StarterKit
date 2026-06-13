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

## Extracted technical values

These values come from the local PDF-to-Markdown working copy and are design
inputs only after footprint, FPC, and sample checks.

| Area | Extracted value | V1 design impact |
|---|---|---|
| Display format | 240 x 320 pixels | Matches locked 2.0 inch-class portrait display target. |
| Operating temperature | -20 to +70 deg C | Acceptable for prototype planning; product temperature validation remains separate. |
| Storage temperature | -30 to +80 deg C | Storage note only; enclosure and battery limits may be tighter. |
| Touch panel | No | V1 stays button-driven; no touch controller or touch FPC routing. |
| Sunlight readable | No | UI brightness/readability must not assume outdoor sunlight performance. |
| Controller | ST7789 | Firmware/display init can target ST7789-class behavior after pinout review. |
| Interface | 4-wire serial SPI | Keep SPI routing and series-resistor placeholders; no parallel bus. |
| VDD | 2.5-3.3 V, 2.8 V typical | 3.3 V rail may power panel logic only after current/thermal review. |
| IOVDD | 1.8-3.3 V, 2.8 V typical | ESP32-S3 3.3 V GPIO compatibility still needs signal-level review. |
| Backlight | 3-chip LED, 45 mA typical, 60 mA maximum, 3.0 V typical, 3.2 V maximum | Backlight MOSFET/current-limit design remains required; do not connect directly without current control. |
| Optical | IPS, 800:1 typical contrast, 300 cd/m2 typical brightness, wide viewing-angle listing | Supports flat-front display target; optical result through smoke resin remains `TODO: VERIFY`. |

## LCD pinout evidence

| Pin | Name | V1 note |
|---:|---|---|
| 1 | NC | Leave unconnected unless ordered drawing differs. |
| 2 | GND | Ground return. |
| 3 | LED- | Backlight cathode; route to controlled driver path. |
| 4 | LED+ | Backlight anode; route with current-limit strategy. |
| 5 | GND | Ground return. |
| 6 | /RESET | Active-low reset GPIO. |
| 7 | RS | Command/data select GPIO. |
| 8 | SDA | SPI data input/output. |
| 9 | SCK | SPI clock. |
| 10 | VDD | Panel power. |
| 11 | IOVDD | I/O power. |
| 12 | CS | Active-low chip select. |
| 13 | GND | Ground return. |
| 14 | NC | Leave unconnected unless ordered drawing differs. |

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
