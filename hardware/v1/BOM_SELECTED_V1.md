# V1 selected BOM direction

This narrows the candidate set for schematic and footprint work. Stock and
pricing are observations from `tsci search --jlcpcb` on 2026-06-12, not a
purchase guarantee. Recheck every line immediately before ordering.

| Block | Selected direction | Package / size | LCSC observation | Fit and rationale | Blocking verification |
|---|---|---|---|---|---|
| MCU/BLE | ESP32-S3-MINI-1-N4R2 | SMD module; planning body 15.4 x 20.5 mm | C3013941, extended, 5,196 shown | Small module, 2 MB PSRAM for frame buffers; rotate antenna toward upper-right edge | Official land pattern/height, GPIO/strap allocation, Japan certification applicability |
| Asset flash | W25Q128JVSIQ | SOIC-8 208 mil | C97521, basic, 110,435 shown | 16 MB local asset option; basic part and hand-reworkable | Confirm secondary-flash ESP-IDF architecture; omit if module flash is sufficient |
| Display | EastRising ER-TFT020-3 | 34.6 x 47.8 x 2.0 mm panel | Off-board/manual assembly | Confirmed supplier dimensions, 240 x 320, ST7789, 4-wire SPI | Order drawing/sample, tail geometry, backlight current, lifecycle |
| Display connector | FH12-14S-0.5SH(55) | 14 pin, 0.5 mm | C5378715, extended, 689 shown | Matches supplier-listed 14-pin connector option | Contact side, mated height, exact footprint and FPC thickness |
| Dynamic NFC | ST25DV04KC-IE6S3 | SO-8 | C3304276, extended, 18,587 shown | Larger package simplifies prototype inspection and rework | Order-code/package pinout, RF tuning network, energy-harvest use decision |
| NFC fallback | NT3H2111W0FHKH | XQFN-8 1.6 x 1.6 mm | C710403, extended, 7,510 shown | Alternate dynamic tag family | Tiny package assembly yield and antenna retuning |
| USB-C | GCT USB4105-GF-A | Horizontal SMT | C3020560, extended, 295 shown | KiCad library footprint exists; offset bottom-right fit | Exact suffix, shell height, drawing and JLC assembly support |
| Charger/power path | BQ24074RGTR | QFN-16 EP 3 x 3 mm | C54313, extended, 736 shown | Power-path operation supports use while charging | Thermal calculation, ILIM/ISET, battery NTC strategy, exposed-pad layout |
| 3.3 V rail | TPS63031DSKR | SON-10 EP 2.5 x 2.5 mm | C15516, extended, 2,740 shown | Buck-boost keeps 3.3 V across LiPo discharge | Peak ESP32/display load, inductor choice, efficiency and stability |
| RGB side light | SK6805-EC15 | 1.5 x 1.5 mm side emitter | C2890035, extended, 161,838 shown | Compact side emission into a resin light pipe | Logic threshold at 3.3 V, current limit, thermal/brightness test |
| Buttons | SKRPACE010 | 4.2 x 3.2 mm SMD | C139797, extended, 156,252 shown | Stock is stronger than the thinner Panasonic candidate | Verify actuator direction/height; find lower-profile alternate if stack fails |
| Piezo | PKLCS1212E4001-R1 | about 12.2 x 12.2 x 3.0 mm | C113159, extended, 4,632 shown | Passive SMD sounder and known mechanical envelope | Drive waveform/voltage, acoustic port and actual package metadata |
| Vibration driver | AO3400A | SOT-23 | C20917, basic, 1,345,927 shown | Common low-side switch; DNP in baseline | Exact manufacturer/order code, gate resistor, flyback strategy and motor current |
| USB ESD | TPD2EUSB30DRTR | SOT-723 | C3040102, extended, 4,708 shown | Low-capacitance USB data protection | LCSC package metadata is inconsistent across listings; verify footprint and pinout |
| Battery | Protected LiPo 402025, 150-165 mAh class | 4.0 x 20 x 25 mm, rotated | Not an LCSC PCBA part | Fits lower rear zone without overlapping the display | Exact supplier, PCM/wires, swelling, shipping/safety documents, runtime |

## Not selected for the baseline

- ESP32-S3-WROOM-1-N16R8 remains a memory-rich fallback, but its larger module
  consumes more of the display/RF edge zone.
- ESP32-S3-MINI-1U is not baseline because an external antenna adds antenna,
  cable, connector, enclosure, and certification variables.
- Vibration motor remains DNP until the 8.5 mm stack and inrush tests pass.
- Aluminum rear parts remain deferred to V2/V3.

## Datasheet and supplier links

- [ESP32-S3-MINI-1 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf)
- [ER-TFT020-3 supplier page and downloads](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc)
- [ST25DV04KC](https://www.st.com/en/nfc/st25dv04kc.html)
- [NTAG I2C plus](https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C)
- [BQ24074](https://www.ti.com/product/BQ24074)
- [TPS63031](https://www.ti.com/product/TPS63031)
- [USB4105](https://gct.co/connector/usb4105)
- [W25Q128JV](https://www.winbond.com/hq/product/code-storage-flash-memory/serial-nor-flash/)
- [TPD2EUSB30](https://www.ti.com/product/TPD2EUSB30)
- [AO3400A](https://www.aosmd.com/products/mosfets/low-voltage-mosfets-12v-30v/ao3400a)
- [PKCELL 402025 example datasheet](https://cdn-shop.adafruit.com/product-files/1317/C1515_-_Li-Polymer_402025_150mAh_3.7V_with_PCM.pdf)
