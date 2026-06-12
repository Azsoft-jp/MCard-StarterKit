# Official documentation index

Accessed: 2026-06-12. Product pages are discovery aids; Help,
Documentation, Support, datasheets, and application notes are preferred for
actual rules. Re-check revisions immediately before design freeze and ordering.

| Topic | Official source | Publisher | Why it matters | Key rule / unresolved question |
|---|---|---|---|---|
| PCB/PCBA | [JLCPCB Japanese Help](https://jlcpcb.com/jp/help) | JLCPCB | Dense process, file, assembly, and ordering guidance | Select exact process before copying limits; TODO: VERIFY current article/revision |
| PCB capabilities | [PCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities) | JLCPCB | Available stack-ups and features | 0.8 mm availability and chosen four-layer stack TODO: VERIFY |
| Parts/assembly | [JLCPCB parts](https://jlcpcb.com/parts) | JLCPCB | PCBA library and stock discovery | Basic/extended class and stock are order-time facts |
| Components | [LCSC FAQ](https://www.lcsc.com/faqs) | LCSC | Ordering, stock, and sourcing policies | Lifecycle evidence for every critical MPN TODO: VERIFY |
| Resin | [JLC3DP Help](https://jlc3dp.com/help) | JLC3DP | Material/process/design rules | V1 resin/tolerance/minimum feature TODO: VERIFY |
| CNC | [JLCCNC Help](https://jlccnc.com/help) | JLCCNC | Future machining constraints | V2/V3 material/tolerance/finish TODO: VERIFY |
| KiCad | [KiCad 9 documentation](https://docs.kicad.org/9.0/) | KiCad project | Schematic, PCB, CLI, file and simulator workflow | Freeze supported KiCad major version |
| Fusion | [Fusion Help](https://help.autodesk.com/view/fusion360/ENU/) | Autodesk | STEP/DXF and ECAD/MCAD handoff | Confirm current import/link/export workflow |
| ESP32-S3 design | [Hardware Design Guidelines](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/index.html) | Espressif | Power, reset, straps, USB, RF layout | Review against selected module revision |
| WROOM module | [ESP32-S3-WROOM-1 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) | Espressif | Dimensions, variants, land pattern, antenna area | Exact N16R8 availability/certification TODO: VERIFY |
| MINI module | [ESP32-S3-MINI-1 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) | Espressif | Smaller-module variants and layout | Requested N8R8 is not assumed valid |
| Display panel | [ER-TFT020-3 supplier page and downloads](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc) | EastRising / BuyDisplay | Panel outline, active area, controller, supply, FPC count and downloadable drawing | Page lists 34.6 x 47.8 x 2.0 mm and 14-pin FPC; drawing, pinout and sample TODO: VERIFY |
| FPC connector | [FH12 series](https://www.hirose.com/product/series/FH12) | Hirose | Connector drawing, contact orientation, FPC and footprint rules | Exact FH12-14S-0.5SH(55) drawing/mated height TODO: VERIFY |
| USB-C receptacle | [USB4105](https://gct.co/connector/usb4105) | GCT | Shell, footprint, mated height and mechanical opening | Exact `-GF-A` suffix and assembly drawing TODO: VERIFY |
| LiPo size example | [402025 150 mAh example datasheet](https://cdn-shop.adafruit.com/product-files/1317/C1515_-_Li-Polymer_402025_150mAh_3.7V_with_PCM.pdf) | PKCELL document hosted by Adafruit | Establishes a realistic protected-cell envelope for packaging | Example only; exact production supplier, PCM, leads, swelling and approvals TODO: VERIFY |
| ST dynamic tag | [ST25DV04KC](https://www.st.com/en/nfc/st25dv04kc.html) | STMicroelectronics | Active I2C dynamic NFC tag documentation | Select memory/package and antenna network |
| NXP fallback | [NTAG I2C plus](https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C) | NXP | Alternative dynamic tag documentation | Verify exact orderable suffix/package |
| USB-C | [USB Type-C resources](https://www.usb.org/usb-charger-pd) | USB-IF | Normative specification discovery | Implement only reviewed USB 2.0 sink/device subset |
| Japan radio | [Radio use and conformity information](https://www.tele.soumu.go.jp/) | MIC, Japan | Legal/regulatory source | Exact module/product technical conformity applicability TODO: VERIFY |

Detailed extraction and unresolved questions are maintained in the topic files.
