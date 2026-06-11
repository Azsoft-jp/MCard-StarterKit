# BOM candidates

Availability and JLC basic/extended status are time-sensitive. `TODO: VERIFY`
means confirm the exact MPN, package, footprint, lifecycle, stock, price, and
assembly eligibility before selection.

| Block | Family | Candidate | Package | Why considered | JLC/LCSC status | Risk | Fallback | Official datasheet |
|---|---|---|---|---|---|---|---|---|
| MCU/BLE | ESP32-S3 | ESP32-S3-WROOM-1-N16R8 | Module | 16 MB flash + 8 MB PSRAM target | TODO: VERIFY | Height/antenna space | WROOM-1U with reviewed external antenna | [Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) |
| MCU/BLE | ESP32-S3 | ESP32-S3-MINI-1-N8 | Module | Smaller footprint | TODO: VERIFY; requested N8R8 option is not confirmed | Lower memory; variant naming | WROOM-1-N16R8 | [Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) |
| Display | ST7789-class TFT | 2.0 inch 240x320 SPI IPS, exact MPN TBD | FPC | Common resolution and SPI interface | TODO: VERIFY | Pinout/outline/supply vary | Alternate verified ST7789/ILI9341 module | TODO: VERIFY supplier datasheet |
| Display connector | 0.5 mm FPC | Hirose FH12-series, pin count TBD | FPC SMT | Established family | TODO: VERIFY | Exact contacts/height | JAE/Amphenol equivalent | [Hirose](https://www.hirose.com/product/series/FH12) |
| Dynamic NFC | ST25DV | ST25DV04KC-IE6S3 | TSSOP-8 | Active dynamic tag with I2C | TODO: VERIFY | Antenna tuning/layout | Larger-memory ST25DVxxKC | [ST](https://www.st.com/en/nfc/st25dv04kc.html) |
| Dynamic NFC fallback | NTAG I2C plus | NT3H2111W0FHK | XQFN-8 | I2C-connected NFC tag fallback | TODO: VERIFY | Package/antenna tuning | ST25DV04KC | [NXP](https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C) |
| External flash option | SPI NOR | W25Q128JVSIQ | SOIC-8 | 16 MB option and broad support | TODO: VERIFY; usually unnecessary with N16 module | Board area/current | GD25Q128 family or omit | [Winbond](https://www.winbond.com/hq/product/code-storage-flash-memory/serial-nor-flash/) |
| USB-C | USB 2.0 receptacle | GCT USB4105 family | Mid-mount SMT | Compact data-capable family | TODO: VERIFY | Shell/height/assembly | Verified HRO/Korean Hroparts equivalent | [GCT](https://gct.co/connector/usb4105) |
| Charger | Single-cell linear | BQ24074 | VQFN-16 | Power-path and thermal regulation | TODO: VERIFY | Cost/package/thermal | MCP73871 or simpler reviewed charger | [TI](https://www.ti.com/product/BQ24074) |
| 3.3 V regulator | Buck-boost | TPS63031 | VSON-10 | 3.3 V across LiPo range | TODO: VERIFY | Layout/availability | TPS63020 family or reviewed buck/LDO architecture | [TI](https://www.ti.com/product/TPS63031) |
| RGB side light | Addressable RGB | SK6805-EC15 family | Side-view SMT | Side emission and compact control | TODO: VERIFY | Protocol/current/availability | Discrete side-view RGB + resistors | TODO: VERIFY manufacturer datasheet |
| Buttons | Low-profile tactile | Panasonic EVP-BB family | SMT | Thin established family | TODO: VERIFY | Force/lifecycle | Alps Alpine SKRP family | [Panasonic](https://industry.panasonic.com/global/en/products/control/switch/light-touch) |
| Audio | Piezo sounder | Murata PKLCS1212E4001-R1 | SMD | Thin piezo family | TODO: VERIFY | Drive level/acoustics | Verified passive piezo disc/SMD | [Murata](https://www.murata.com/en-global/products/sound/sounder) |
| Vibration option | Coin motor | 8-10 mm 3 V coin motor, exact MPN TBD | Wire/pad | Optional tactile feedback | TODO: VERIFY | Thickness/inrush/EMI | DNP footprint | TODO: VERIFY supplier datasheet |
| Motor driver | Logic NMOS | AO3400A | SOT-23 | Common low-side switch | TODO: VERIFY | Counterfeits/gate behavior | Si2302-class verified NMOS | [AOS](https://www.aosmd.com/products/mosfets/low-voltage-mosfets-12v-30v/ao3400a) |
| USB ESD | Low-cap TVS | TPD2EUSB30 | SOT-23-6 | USB 2.0 data-line protection | TODO: VERIFY | Layout/capacitance | USBLC6-2SC6 | [TI](https://www.ti.com/product/TPD2EUSB30) |
| Test access | Test pads | ENIG pads + pogo fixture | PCB feature | No added BOM height | JLC process TODO: VERIFY | Wear/spacing | Low-profile test points | KiCad/JLC rules TODO |
