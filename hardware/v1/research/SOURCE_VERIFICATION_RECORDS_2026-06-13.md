# V1 source verification records 2026-06-13

Status: external-source evidence gathered for PR-05 TODO reduction.
Access date: 2026-06-13.
Reviewer: Codex.

These records summarize public official/manufacturer/fabrication sources plus
JLCPCB parts-library observations. They do not replace sample measurement,
assembled RF/NFC tuning, KiCad footprint review, Fusion 360 interference review,
or regulatory review.

## Manufacturer and official source records

| Block | Candidate | Source | Publisher | Extracted rule / evidence | Design impact | Remaining gap |
|---|---|---|---|---|---|---|
| BLE module | ESP32-S3-MINI-1-N4R2 | ESP32-S3-MINI-1 / MINI-1U datasheet, `https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf` | Espressif | Datasheet source covers MINI family ordering options, mechanical envelope, pinout, land pattern, and antenna placement sections. | MINI remains the compact V1 planning direction; exact land pattern and antenna keepout must be copied from the selected datasheet revision into KiCad and Fusion 360. | `TODO: VERIFY` exact revision used for footprint, antenna keepout import, GPIO straps, power budget, and certification applicability. |
| BLE module fallback | ESP32-S3-WROOM-1-N16R8 | ESP32-S3-WROOM-1 / WROOM-1U datasheet, `https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf` | Espressif | Datasheet source covers WROOM family ordering options, mechanical envelope, pinout, land pattern, and antenna guidance. | WROOM remains a memory-rich fallback but consumes more edge length and stack height than MINI; do not silently swap into the 46 x 84 mm floorplan. | `TODO: VERIFY` floorplan fit, exact keepout, GPIO straps, height stack, and certification applicability before use. |
| BLE/RF layout | ESP32-S3 hardware design | ESP32-S3 Hardware Design Guidelines, `https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/index.html` | Espressif | Official layout guidance controls power, reset, strapping pins, USB, decoupling, RF routing, and antenna placement for ESP32-S3 designs. | Keep the module antenna at the board edge, enforce datasheet RF/no-metal restrictions, and review assembled-product geometry rather than bare schematic only. | `TODO: VERIFY` exact selected-module keepout imported as enforceable KiCad/CAD geometry and reviewed against case/display/battery/NFC. |
| Display | ER-TFT020-3 | Product page and downloads, `https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc` | EastRising / BuyDisplay | Supplier source identifies ER-TFT020-3 as a 2.0 inch 240 x 320 IPS TFT direction with ST7789/SPI and 14-pin 0.5 mm connector option. | Display target remains 2.0 inch-class 240 x 320 IPS TFT; keep the upper display window and 14-pin FPC path in V1 planning. | `TODO: VERIFY` controlled drawing revision, purchased sample dimensions, FPC contact side, pinout, backlight current, and lifecycle before layout release. |
| Display connector | FH12-14S-0.5SH(55) | FH12 series page, `https://www.hirose.com/product/series/FH12` | Hirose | Manufacturer source documents FH12 as a 0.5 mm pitch FPC/FFC connector family with 14-position options, low-profile horizontal ZIF variants, and manufacturer drawings. | FH12 remains the reference 14-position 0.5 mm ZIF direction for the display connector. | `TODO: VERIFY` exact suffix drawing, contact side, FPC thickness, mated height, actuator access, footprint, and JLCPCB assembly preview. |
| Dynamic NFC preferred | ST25DV04KC-IE6S3 | ST25DV04KC datasheet, `https://www.st.com/resource/en/datasheet/st25dv04kc.pdf`; ST product page, `https://www.st.com/en/nfc/st25dv04kc.html` | STMicroelectronics | ST25DV04KC source covers dynamic NFC/RFID tag behavior with I2C host interface and passive 13.56 MHz tag interface, plus package/order-code and antenna/tuning entry points. | ST25DV remains preferred because the SO-8 direction is prototype-friendly and supports the V1 dynamic-tag-only architecture. | `TODO: VERIFY` exact order suffix/package drawing, GPO/field-detect use, pull-ups, energy-harvest decision, RF tuning network, and final LCSC/JLCPCB order preview. |
| Dynamic NFC fallback | NT3H2111W0FHKH | NT3H2111/2211 datasheet, `https://www.nxp.com/docs/en/data-sheet/NT3H2111_2211.pdf`; product page, `https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C` | NXP | NXP source covers NTAG I2C plus connected-tag behavior, I2C interface, field-detect/pass-through behavior, and package-specific implementation requirements. | NTAG I2C remains a fallback only; it changes package, pinout, firmware driver, memory model, and antenna tuning. | `TODO: VERIFY` exact XQFN footprint/exposed-pad handling, suffix, firmware delta, and retuning impact. |
| USB-C connector | USB4105-GF-A family | USB4105 product page, `https://gct.co/connector/usb4105` | GCT | Manufacturer source identifies USB4105 as a horizontal USB Type-C receptacle family with drawing/CAD resources and ordering variants including `GF-A` suffixes. | USB-C opening and lower-right insertion volume remain tied to the exact selected suffix and drawing. | `TODO: VERIFY` exact suffix, shell/stake dimensions, board-edge datum, plug/cable clearance, and JLCPCB footprint preview. |
| USB-C sink behavior | USB Type-C resources | USB Type-C Cable and Connector resources, `https://www.usb.org/usb-charger-pd` | USB-IF | USB-IF is the normative source location for USB-C connector, cable, and power-delivery specifications. | V1 remains USB 2.0 device/sink only; CC behavior must be implemented from the current USB-C specification, not copied from informal examples. | `TODO: VERIFY` two independent Rd implementation, no USB-PD claim, and schematic review against current USB-IF spec. |
| Charger | BQ24074RGTR | BQ2407x datasheet, `https://www.ti.com/lit/ds/symlink/bq24074.pdf` | Texas Instruments | TI source covers a single-cell Li-ion charger/power-path family with programmable input/charge limits, thermal regulation, NTC/TS functions, and VQFN package drawings. | BQ24074 remains viable only after V1 charge current, thermals, TS/NTC strategy, and exposed-pad layout are reviewed. | `TODO: VERIFY` actual charge current from selected cell, thermal rise in 8.5 mm region, TS policy, and layout implementation. |
| 3.3 V regulator | TPS63031DSKR | TPS6303x datasheet, `https://www.ti.com/lit/ds/symlink/tps63031.pdf` | Texas Instruments | TI source covers buck-boost operation, package, electrical limits, inductor/layout dependencies, and thermal constraints. | TPS63031 remains the 3.3 V rail direction only if the power budget and layout meet measured load transients. | `TODO: VERIFY` inductor choice, saturation current, efficiency, load transient, thermal rise, and whether buck-boost is required. |
| PCB fabrication | 0.8 mm / 1.0 mm board options | PCB capabilities, `https://jlcpcb.com/capabilities/pcb-capabilities` | JLCPCB | JLCPCB capabilities page is the official source for current board thickness, stack-up, and fabrication limits. | Keep 0.8 mm preferred and 1.0 mm fallback as planning values until exact quote/process review is done. | `TODO: VERIFY` exact four-layer stack, impedance service, minimum rules, panelization, and final order settings. |
| PCBA process | SMT assembly rules | JLCPCB Help, `https://jlcpcb.com/help` and parts library, `https://jlcpcb.com/parts` | JLCPCB | JLCPCB help and parts library are the official current sources for BOM/CPL format, assembly rules, basic/extended classification, and order-time availability. | Keep BOM and CPL verification as an order-preview gate; dated stock observations are not purchase guarantees. | `TODO: VERIFY` footprint preview, rotation, side, DNP/manual-install flags, stock, and class immediately before order. |
| Part sourcing | LCSC/JLC sourcing | LCSC FAQ, `https://www.lcsc.com/faqs`; JLCPCB parts library search via `tsci search --jlcpcb` | LCSC / JLCPCB | Distributor/library data provides sourcing evidence and dated availability observations only. | Record controlled LCSC code per line; do not select by MPN string alone. | `TODO: VERIFY` stock, lifecycle, manufacturer identity, and PCBA class during order preparation. |
| Resin case | Transparent smoke resin process | JLC3DP Help, `https://jlc3dp.com/help` | JLC3DP | JLC3DP help is the official process source for material/process capabilities and design constraints. | Fusion 360 model must wait for selected process limits before release. | `TODO: VERIFY` exact transparent smoke material/process, wall/rib/snap/boss limits, tolerance, tint, UV aging, and light leakage. |
| Japan radio | BLE operation in Japan | MIC radio-equipment source index, `https://www.tele.soumu.go.jp/` | Ministry of Internal Affairs and Communications, Japan | Official source location for Japanese radio-equipment rules and technical conformity information. | Do not claim Japan radio compliance from SoC/module choice alone. | `TODO: VERIFY` exact module certificate and finished-product applicability with current MIC guidance or qualified reviewer. |

## Espressif documentation URLs supplied 2026-06-13

The following Espressif `documentation.espressif.com` URLs were checked as
additional official source entry points. They supersede older mirrored
`espressif.com/sites/default/files/documentation/...` URLs for future refreshes
when available.

| Source | Access result | Design impact | Remaining gap |
|---|---|---|---|
| `https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf` | Opened as PDF. Identified ESP32-S3-WROOM-1/WROOM-1U datasheet version 1.8. | Prefer this URL for WROOM-1/WROOM-1U module dimensions, ordering options, pinout, land pattern, and antenna layout review. | `TODO: VERIFY` exact selected WROOM variant before any fallback placement. |
| `https://documentation.espressif.com/esp32-s3-mini-1_mini-1u_datasheet_en.pdf` | Opened as PDF. Identified ESP32-S3-MINI-1/MINI-1U datasheet version 1.7. | Prefer this URL for MINI-1/MINI-1U module dimensions, ordering options, pinout, land pattern, and antenna layout review. | `TODO: VERIFY` exact keepout import and GPIO/strap mapping for the selected MINI variant. |
| `https://documentation.espressif.com/esp32-s3-wroom-2_datasheet_en.pdf` | Opened as PDF. Identified ESP32-S3-WROOM-2 datasheet version 1.7. | WROOM-2 is a separate larger-memory module family; record as a possible future reference, not V1 default. | `TODO: VERIFY` mechanical/RF fit, sourcing, and memory need before considering. |
| `https://documentation.espressif.com/esp32-s3_datasheet_en.pdf` | Opened as PDF. Identified ESP32-S3 Series datasheet version 2.2. | Use as SoC-level source for GPIO, peripherals, USB, security features, power, and electrical limits behind module-level decisions. | `TODO: VERIFY` selected module datasheet still controls module footprint and antenna. |
| `https://documentation.espressif.com/esp-test-tools/en/latest/esp32s3/esp-test-tools-en-master-esp32s3.pdf` | HTTP 200 PDF by `curl -I`; PDF text extraction was not available locally. | Add as official test-tools source entry point for future RF/production/test-method review. | `TODO: VERIFY` content review before adopting any test method. |
| `https://documentation.espressif.com/AR2026-005_Security_Advisory_Concerning_AES_Key_Recovery_Using_Voltage_Fault_Injection_on%20ESP32-S3_EN.pdf` | HTTP 200 PDF by `curl -I`; PDF text extraction was not available locally. | Add as official security-advisory source entry point. V1 should avoid claims about secure key protection until advisory impact is reviewed. | `TODO: VERIFY` advisory scope, affected revisions, mitigations, and firmware/security impact. |

## JLCPCB parts-library observations

Observed with `tsci search --jlcpcb` on 2026-06-13. Treat as dated
availability evidence only.

| Candidate | Observed JLC/LCSC code | Stock observed | Design note |
|---|---:|---:|---|
| ESP32-S3-MINI-1-N4R2 | C3013941 | 5,196 | Compact BLE module direction; order-time review still required. |
| ESP32-S3-MINI-1U-N4R2 | C22356044 | 65 | U.FL variant appears separately; not V1 default. |
| ESP32-S3-WROOM-1-N16R8 | C2913202 | 21,608 | Memory-rich fallback; mechanical/RF fit not assumed. |
| ESP32-S3-WROOM-1U-N16R8 | C3013946 | 14,298 | U.FL variant appears separately; not V1 default. |
| FH12-14S-0.5SH(55) | C5378715 | 689 | Display connector direction; exact drawing/contact side still required. |
| ST25DV04KC-IE6S3 | C3304276 | 18,587 | Preferred dynamic NFC tag direction. |
| NT3H2111W0FHKH | C710403 | 7,510 | Dynamic NFC fallback; not drop-in. |
| USB4105-GF-A-060 | C3025063 | 788 | Same USB4105 family variant; exact suffix/stake height must match CAD. |
| USB4105-GF-A | C3020560 | 295 | Current USB-C direction from prior BOM notes. |
| USB4105-GF-A-120 | C5184243 | 233 | Same family variant; not default without drawing review. |
| BQ24074RGTR | C54313 | 736 | Charger direction; thermal/current review still required. |
| TPS63031DSKR | C15516 | 2,740 | Regulator direction; inductor/layout verification still required. |
| SKRPACE010 | C139797 | 156,252 | Rear-button direction; actuator/cap fit still required. |

## User-supplied source updates 2026-06-13

| Block | Supplied source | Access result | Design impact | Remaining gap |
|---|---|---|---|---|
| Display | ER-TFT020-3 direct PDF, `https://www.buydisplay.com/download/manual/ER-TFT020-3_Datasheet.pdf?srsltid=AfmBOorCWlMjks7PSPjCDoQhvodbp8LBMI4BdzbvsCgzY_I_8h4ud11H` | `curl -I` returned HTTP 403 Cloudflare challenge. Product page `https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc` opened and showed a 2 inch 240 x 320 IPS TFT product with 14-pin 0.50 mm ZIF option. | Keep ER-TFT020-3 as display candidate and require the direct PDF or supplier drawing before footprint/window release. | `TODO: VERIFY` PDF content, drawing revision, active/visible area, pinout, FPC contact side, backlight, and measured sample. |
| Display connector | Hirose FH12 series, `https://www.hirose.com/ja/product/series/FH12#` | Opened Hirose series page; page notes JavaScript is required for code/preview areas. | Keep Hirose FH12 as manufacturer source entry point. Exact model datasheet must be fetched by part number. | `TODO: VERIFY` FH12-14S-0.5SH(55) model-specific datasheet, contact side, mated height, FPC thickness, footprint, and assembly preview. |
| Dynamic NFC preferred | ST25DV04KC datasheet, `https://www.st.com/resource/en/datasheet/st25dv04kc.pdf` | Opened as ST datasheet PDF source. | Confirms ST25DV04KC datasheet remains the preferred dynamic-tag source. | `TODO: VERIFY` exact IE6S3 package/order mapping and tuned antenna network. |
| Dynamic NFC fallback | NXP Japan NTAG I2C plus product page, `https://www.nxp.jp/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-ic-plus-2k-nfc-forum-type-2-tag-with-ic-interface:NTAG_I2C` | Opened NXP Japan product page. | Adds Japanese NXP product entry point for NTAG I2C plus fallback and ZIP/document downloads. | `TODO: VERIFY` ZIP contents, exact NT3H2111W0FHKH package, exposed-pad implementation, and firmware/antenna retune impact. |
| USB-C connector | DigiKey USB4105-GF-A listing, `https://www.digikey.jp/ja/products/detail/gct/USB4105-GF-A/11198441` | Opened DigiKey Japan product listing. | Adds distributor evidence for USB4105-GF-A availability; not a footprint authority. | `TODO: VERIFY` manufacturer drawing from GCT, exact suffix, shell/stake dimensions, footprint, and JLCPCB preview. |
| Charger | TI Japan BQ24074 page, `https://www.ti.com/product/ja-jp/BQ24074` | Opened TI product page. | Adds localized TI product entry point for BQ24074. | `TODO: VERIFY` datasheet revision, charge-current programming, TS policy, thermal rise, and layout. |
| Regulator | TI Japan TPS63031 page, `https://www.ti.com/product/ja-jp/TPS63031` | Opened TI product page. | Adds localized TI product entry point for TPS63031. | `TODO: VERIFY` datasheet revision, inductor, compensation/stability, thermal rise, and rail load transient. |
| PCB fabrication | JLCPCB capabilities, `https://jlcpcb.com/capabilities/pcb-capabilities` | Opened JLCPCB capabilities page. | Keep as official PCB capability source for board thickness and manufacturing limits. | `TODO: VERIFY` exact four-layer stack, impedance, panel, and order settings before release. |
| Resin case | JLC3DP design guideline, `https://jlc3dp.com/help/article/212-3D-Printing-Design-Guideline` | Opened and redirected to `https://jlc3dp.com/help/article/3d-printing-design-guideline`. | Use as JLC3DP design-guideline entry point for CAD release checks. | `TODO: VERIFY` selected transparent smoke material/process, wall/rib/snap/boss limits, tolerance, tint, UV aging, and light leakage. |
| Japan radio | MIC technical conformity page, `https://www.tele.soumu.go.jp/e/sys/equ/tech/index.htm` | `curl -I` returned HTTP 403 from CloudFront in this environment. | Keep as official MIC source entry point but do not claim contents reviewed. | `TODO: VERIFY` page content and exact module/finished-product applicability. |
| Japan radio law | Radio Act translation, `https://www.japaneselawtranslation.go.jp/ja/laws/view/4510` | Opened Japanese Law Translation page for Radio Act, Act No. 131 of 1950, last version Act No. 40 of 2023. | Adds legal-reference entry point for Japanese radio-law review. | `TODO: VERIFY` technical conformity applicability with current MIC guidance or qualified reviewer; this is not legal advice. |

## Items not cleared by external evidence

- Display sample measurements, FPC bend/fit, lens/adhesive stack, and manual assembly yield.
- Protected LiPo supplier selection, PCM/wires, swelling, safety paperwork, charge current, runtime, and thermal measurement.
- BLE antenna keepout implementation in actual KiCad geometry and Fusion 360 no-go volume.
- NFC loop geometry, tuning values, measured Q, reader interoperability, and assembled-case retune.
- USB-C plug/cable mechanical clearance against the resin case and battery volume.
- JLC3DP transparent smoke resin optical behavior, UV aging, light leakage, and snap/boss tolerances for the final process.
- Japan radio certification applicability for the exact module and finished product.
