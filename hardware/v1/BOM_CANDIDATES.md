# BOM candidates

Availability and JLC basic/extended status are time-sensitive. `TODO: VERIFY`
means confirm the exact MPN, package, footprint, lifecycle, stock, price, and
assembly eligibility before selection.

The narrowed V1 direction and dated search observations are in
[`BOM_SELECTED_V1.md`](BOM_SELECTED_V1.md). This file retains alternates.

| Block | Family | Candidate | Package | Why considered | JLC/LCSC status | Risk | Fallback | Official datasheet |
|---|---|---|---|---|---|---|---|---|
| MCU/BLE | ESP32-S3 | ESP32-S3-WROOM-1-N16R8 | Module | 16 MB flash + 8 MB PSRAM target | TODO: VERIFY | Height/antenna space | WROOM-1U with reviewed external antenna | [Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) |
| MCU/BLE | ESP32-S3 | ESP32-S3-MINI-1-N4R2 | Module | Smaller footprint with 2 MB PSRAM | C3013941 observed 2026-06-12; TODO: REVERIFY | 4 MB module flash; custom footprint | WROOM-1-N16R8 | [Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) |
| Display | ST7789-class TFT | EastRising ER-TFT020-3 | 14-pin FPC; 34.6 x 47.8 x 2.0 mm | Supplier dimensions fit the split floorplan | Off-board/manual assembly; sample required | Tail/pinout/backlight/lifecycle | Alternate drawing-verified ST7789 panel | [EastRising](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc) |
| Display connector | 0.5 mm FPC | FH12-14S-0.5SH(55) | 14-pin FPC SMT | Matches supplier-listed contact count | C5378715 observed 2026-06-12; TODO: REVERIFY | Contact side/mated height | Exact drawing-compatible JAE/Amphenol equivalent | [Hirose](https://www.hirose.com/product/series/FH12) |
| Dynamic NFC | ST25DV | ST25DV04KC-IE6S3 | SO-8 per JLC listing; verify ST order code | Active dynamic tag with I2C | C3304276 observed 2026-06-12; TODO: REVERIFY | Antenna tuning/layout | Larger-memory ST25DVxxKC | [ST](https://www.st.com/en/nfc/st25dv04kc.html) |
| Dynamic NFC fallback | NTAG I2C plus | NT3H2111W0FHK | XQFN-8 | I2C-connected NFC tag fallback | TODO: VERIFY | Package/antenna tuning | ST25DV04KC | [NXP](https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C) |
| External flash option | SPI NOR | W25Q128JVSIQ | SOIC-8 208 mil | 16 MB local asset option | C97521 basic observed 2026-06-12; TODO: REVERIFY | Secondary-flash software architecture | GD25Q128 family or omit | [Winbond](https://www.winbond.com/hq/product/code-storage-flash-memory/serial-nor-flash/) |
| USB-C | USB 2.0 receptacle | GCT USB4105-GF-A | Horizontal SMT | Compact data-capable family and KiCad footprint candidate | C3020560 observed 2026-06-12; TODO: REVERIFY | Shell/height/suffix/assembly | Verified HRO/Korean Hroparts equivalent | [GCT](https://gct.co/connector/usb4105) |
| Charger | Single-cell linear | BQ24074RGTR | QFN-16 EP 3 x 3 mm | Power-path and thermal regulation | C54313 observed 2026-06-12; TODO: REVERIFY | Cost/package/thermal | MCP73871 or simpler reviewed charger | [TI](https://www.ti.com/product/BQ24074) |
| 3.3 V regulator | Buck-boost | TPS63031DSKR | SON-10 EP 2.5 x 2.5 mm | 3.3 V across LiPo range | C15516 observed 2026-06-12; TODO: REVERIFY | Layout/availability | TPS63020 family or reviewed buck/LDO architecture | [TI](https://www.ti.com/product/TPS63031) |
| RGB side light | Addressable RGB | SK6805-EC15 | Side-view 1.5 x 1.5 mm | Side emission and compact control | C2890035 observed 2026-06-12; TODO: REVERIFY | Protocol/current/datasheet | Discrete side-view RGB + resistors | TODO: VERIFY manufacturer datasheet |
| Buttons | Low-profile tactile | Alps Alpine SKRPACE010 | SMD 4.2 x 3.2 mm | Stronger observed stock than thin EVP-BB option | C139797 observed 2026-06-12; TODO: REVERIFY | Height/force/cap interface | Panasonic EVP-BB family | [Alps Alpine](https://tech.alpsalpine.com/e/products/category/switch/sub/01/series/skrp/) |
| Audio | Piezo sounder | Murata PKLCS1212E4001-R1 | SMD 12.2 mm class | Thin piezo family | C113159 observed 2026-06-12; TODO: REVERIFY | Drive level/acoustics/height | Verified passive piezo disc/SMD | [Murata](https://www.murata.com/en-global/products/sound/sounder) |
| Vibration option | Coin motor | 8-10 mm 3 V coin motor, exact MPN TBD | Wire/pad | Optional tactile feedback | TODO: VERIFY | Thickness/inrush/EMI | DNP footprint | TODO: VERIFY supplier datasheet |
| Motor driver | Logic NMOS | AO3400A | SOT-23 | Common low-side switch | C20917 basic observed 2026-06-12; TODO: verify manufacturer | Counterfeits/gate behavior | Si2302-class verified NMOS | [AOS](https://www.aosmd.com/products/mosfets/low-voltage-mosfets-12v-30v/ao3400a) |
| USB ESD | Low-cap TVS | TPD2EUSB30DRTR | SOT-723 | USB 2.0 data-line protection | C3040102 observed 2026-06-12; package metadata conflicts across listings | Layout/capacitance/footprint | USBLC6-2SC6 | [TI](https://www.ti.com/product/TPD2EUSB30) |
| Test access | Test pads | ENIG pads + pogo fixture | PCB feature | No added BOM height | JLC process TODO: VERIFY | Wear/spacing | Low-profile test points | KiCad/JLC rules TODO |
