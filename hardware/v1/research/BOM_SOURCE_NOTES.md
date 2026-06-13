# V1 BOM source notes

Accessed: 2026-06-12. External evidence refresh added 2026-06-13 in
`SOURCE_VERIFICATION_RECORDS_2026-06-13.md`.

This file records the sources used to narrow the V1 BOM. It summarizes only
public information. Stock and assembly observations came from
`tsci search --jlcpcb` and must be repeated in the official JLCPCB parts library
and order preview before purchase.

## Official manufacturer sources

| Block | Source | Publisher | Selection evidence | Unresolved |
|---|---|---|---|---|
| ESP32-S3 WROOM | [ESP32-S3-WROOM-1 / 1U datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) | Espressif | Lists WROOM-1-N16R8 with 16 MB flash, 8 MB PSRAM, 18.0 x 25.5 x 3.1 mm module size, 3.0-3.6 V supply, land pattern, and antenna guidance | `TODO: VERIFY` exact revision used for KiCad, keepout implementation, GPIO straps, thermal/power budget, and certification applicability |
| ESP32-S3 MINI | [ESP32-S3-MINI-1 / 1U datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) | Espressif | Current comparison lists MINI-1-N8 and MINI-1-N4R2; N4R2 is 15.4 x 20.5 x 2.4 mm and provides 2 MB PSRAM | `ESP32-S3-MINI-1-N8R8` is not listed; `TODO: VERIFY` compact fallback memory and floorplan acceptance |
| ESP32-S3 design | [ESP32-S3 hardware design guidelines](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/index.html) | Espressif | Controls power, reset, straps, USB, decoupling, RF placement, and module layout | `TODO: VERIFY` schematic against the selected module and current guideline revision |
| Display | [ER-TFT020-3 product and downloads](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc) | EastRising / BuyDisplay | Lists 240 x 320 IPS, ST7789, 4-wire SPI, 14-pin 0.5 mm connector option, 34.6 x 47.8 x 2.0 mm outline, and 2.8 V typical supply | `TODO: VERIFY` controlled drawing, sample, pinout, backlight, tail, contact side, and lifecycle |
| FPC connector | [FH12 series](https://www.hirose.com/product/series/FH12) | Hirose | Covers 0.5 mm pitch, 14 positions, 2.0 mm family height option, 0.5 A, 50 V, and top/bottom contact variants | `TODO: VERIFY` exact FH12-14S-0.5SH(55) drawing and panel compatibility |
| ST dynamic tag | [ST25DV04KC datasheet](https://www.st.com/resource/en/datasheet/st25dv04kc.pdf) | STMicroelectronics | Documents the dynamic NFC/I2C device, SO8N package geometry, GPO, energy harvesting, mailbox, and antenna interface | `TODO: VERIFY` IE6S3 order mapping, pinout, selected features, and antenna network |
| NXP dynamic tag fallback | [NTAG I2C plus datasheet](https://www.nxp.com/docs/en/data-sheet/NT3H2111_2211.pdf) | NXP | Documents NT3H2111, XQFN8 package, I2C, field detect, pass-through, and energy harvesting | `TODO: VERIFY` exact suffix, exposed-pad implementation, and separate antenna/firmware review |
| USB-C connector | [USB4105 series](https://gct.co/connector/usb4105) | GCT | Active 16-contact horizontal USB 2.0 Type-C receptacle family; page lists 3.31 mm profile and drawing/CAD resources | `TODO: VERIFY` exact `-GF-A` stake length, drawing revision, board edge, and assembly support |
| USB Type-C | [USB Type-C resources](https://www.usb.org/usb-charger-pd) | USB-IF | Normative resource location for sink/device wiring and CC behavior | `TODO: VERIFY` reviewed USB 2.0 sink implementation with two independent Rd resistors |
| USB ESD | [TPD2EUSB30 datasheet](https://www.ti.com/lit/ds/symlink/tpd2eusb30.pdf) | Texas Instruments | Manufacturer package drawings and low-capacitance ESD characteristics control the footprint | `TODO: VERIFY` DRT package against the selected JLC library record; current marketplace metadata conflicts |
| USB ESD fallback | [USBLC6-2 datasheet](https://www.st.com/resource/en/datasheet/usblc6-2.pdf) | STMicroelectronics | Documents two-line protection and SOT23-6L option | `TODO: VERIFY` exact order code and effect on USB 2.0 routing |
| Charger | [BQ24074 datasheet](https://www.ti.com/lit/ds/symlink/bq24074.pdf) | Texas Instruments | Documents single-cell 4.2 V charging, dynamic power path, programmable input/charge limits, thermal regulation, NTC input, and VQFN-16 EP | `TODO: VERIFY` V1 charge/current settings, cell compatibility, thermal result, and layout |
| Regulator | [TPS63031 datasheet](https://www.ti.com/lit/ds/symlink/tps63031.pdf) | Texas Instruments | Documents fixed 3.3 V buck-boost operation, 1 A switch limit, and 2.5 x 2.5 mm VSON package | `TODO: VERIFY` real output-current margin, inductor, stability, efficiency, and topology |
| Battery connector | [JST SH series](https://www.jst-mfg.com/product/pdf/eng/eSH.pdf) | JST | Documents 1.0 mm pitch, low-profile wire-to-board system, BM02B header family, 1.0 A rating, and cable/contact range | `TODO: VERIFY` full harness, polarity, height, strain relief, and exact suffix |
| SPI NOR | [W25Q128JV family](https://www.winbond.com/hq/product/code-storage-flash-memory/serial-nor-flash/) | Winbond | Manufacturer family source for the optional 128 Mbit SPI NOR | `TODO: VERIFY` exact order-code datasheet, pinout, lifecycle, and software need |
| MOSFET | [AO3400A](https://www.aosmd.com/products/mosfets/low-voltage-mosfets-12v-30v/ao3400a) | Alpha and Omega Semiconductor | Manufacturer source for a logic NMOS candidate used in DNP-capable switched loads | `TODO: VERIFY` exact manufacturer behind the LCSC line and guaranteed performance at 3.3 V gate drive |
| Buttons | [SKRP series](https://tech.alpsalpine.com/e/products/category/switch/sub/01/series/skrp/) | Alps Alpine | Manufacturer family source for low-profile tactile switches | `TODO: VERIFY` exact suffix, actuator geometry, travel, force, and land pattern |
| Piezo | [Sound components](https://www.murata.com/en-global/products/sound/sounder) | Murata | Manufacturer source for the passive piezo family | `TODO: VERIFY` direct PKLCS1212E4001-R1 drawing, drive limit, footprint, height, and assembly status |

## JLCPCB and LCSC sources

- [JLCPCB Parts Library](https://jlcpcb.com/parts): official assembly-part
  discovery and order-time classification.
- [JLCPCB Help](https://jlcpcb.com/help): BOM/CPL, assembly, and process rules.
- [JLCPCB PCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities):
  selected stackup and fabrication capability source.
- [LCSC FAQ](https://www.lcsc.com/faqs): sourcing and order policy.

The following are dated discovery observations, not purchasing guarantees:

| Candidate | LCSC | Class observed | Stock observed |
|---|---:|---|---:|
| ESP32-S3-WROOM-1-N16R8 | C2913202 | Extended | 21,608 |
| ESP32-S3-MINI-1-N4R2 | C3013941 | Extended | 5,196 |
| FH12-14S-0.5SH(55) | C5378715 | Extended | 689 |
| ST25DV04KC-IE6S3 | C3304276 | Extended | 18,587 |
| NT3H2111W0FHKH | C710403 | Extended | 7,510 |
| W25Q128JVSIQ | C97521 | Basic | 110,435 |
| USB4105-GF-A | C3020560 | Extended | 295 |
| TYPE-C-31-M-12 | C165948 | Extended | 336,394 |
| TPD2EUSB30DRTR | C3040102 | Extended | 4,708 |
| USBLC6-2SC6 | C7519 | Extended | 53,546 |
| BQ24074RGTR | C54313 | Extended | 736 |
| MCP73871T-2CCI/ML | C511310 | Extended | 439 |
| BM02B-SRSS-TB(LF)(SN) | C160388 | Extended | 45 |
| TPS63031DSKR | C15516 | Extended | 2,740 |
| TPS63020DSJR | C15483 | Extended | 2,473 |
| SK6805-EC15 | C2890035 | Extended | 161,838 |
| SKRPACE010 | C139797 | Extended | 156,252 |
| PKLCS1212E4001-R1 | C113159 | Extended | 4,632 |
| AO3400A listing | C20917 | Basic | 1,345,927 |
| 4.7 kOhm 0402WGF4701TCE | C25900 | Basic | 9,379,077 |
| 22 Ohm RC0402FR-0722RL | C114765 | Extended | 978,014 |

## Source conflicts and limitations

- JLC search results for `TPD2EUSB30DRTR` showed inconsistent package text and
  multiple manufacturer-like suffixes. The TI package drawing and exact LCSC
  manufacturer record must be reconciled before footprint approval.
- JLC search can return duplicate MPN records with different class, stock, and
  supplier metadata. Select one controlled LCSC code rather than an MPN string
  alone.
- Display and motor installation are outside normal SMT assumptions. Their
  drawings, labor, adhesive, cable routing, and inspection belong in the
  manufacturing plan.
- A generic part with large stock is not automatically an acceptable alternate.
  Electrical, package, firmware, RF, and mechanical equivalence must be reviewed.
- No exact module or finished-product Japan radio certification was verified in
  this research. The status remains `TODO: VERIFY`.

## Community notes

No community source was used to set an electrical rating, footprint, antenna
rule, or assembly status in this shortlist. Community libraries may be used
later to accelerate symbol/footprint entry only after line-by-line comparison
with official package drawings.
