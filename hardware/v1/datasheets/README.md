# Datasheet policy

Keep links, document titles, revisions, checksums, and review notes here.
Do not vendor large copyrighted PDFs when a stable official URL is available.

## Downloaded source evidence 2026-06-14

Downloaded public source links into `/tmp/mcard-source-downloads` and converted
technical PDFs into `/tmp/mcard-source-md` with:

```bash
docling --to md --no-ocr --image-export-mode placeholder --output /tmp/mcard-source-md <pdf>
```

The downloaded PDFs and generated Markdown files are not committed. Record only
hashes and extracted design notes in this repository.

| Source | Local artifact | Source SHA-256 | Markdown artifact | Markdown SHA-256 | Status / use |
|---|---|---|---|---|---|
| Espressif ESP32-S3-WROOM-1/WROOM-1U datasheet | `/tmp/mcard-source-downloads/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf` | `27d71971da07c280c6068d08c74720d1a25b8f20cf8494dc1765bdd28d40d435` | `/tmp/mcard-source-md/esp32-s3-wroom-1_wroom-1u_datasheet_en.md` | `25b66ef388aeb0231703b9d8b7e986996435faa3ef1b403a79edd039e69d9482` | Used module version, antenna, placement, land-pattern evidence. |
| Espressif ESP32-S3-MINI-1/MINI-1U datasheet | `/tmp/mcard-source-downloads/esp32-s3-mini-1_mini-1u_datasheet_en.pdf` | `4d4b7f1c17b484c627aaa0f806566c48a6124a8e466c6d21d99210e6eacdef04` | `/tmp/mcard-source-md/esp32-s3-mini-1_mini-1u_datasheet_en.md` | `cf1ae31b67c9f0056089b7b954cbc90ff8ca10642c742e1dd76935b38872cb39` | Used compact module version, antenna, placement, land-pattern evidence. |
| Espressif ESP32-S3-WROOM-2 datasheet | `/tmp/mcard-source-downloads/esp32-s3-wroom-2_datasheet_en.pdf` | `71701928d62519658cd40e4e5f001c4e16bef8ab634e5c9ada56f3535896ae1c` | `/tmp/mcard-source-md/esp32-s3-wroom-2_datasheet_en.md` | `5604b60877fc23cdddcf8a9d1f2680c3f4176f455f8fa85bbdf2915a8687b10c` | Used as memory-rich fallback evidence; not selected by default. |
| Espressif ESP32-S3 SoC datasheet | `/tmp/mcard-source-downloads/esp32-s3_datasheet_en.pdf` | `2d5a7cb7fd559d8d972bd88db32669c0196d23f22d7afaafb0f63d099b589a3f` | `/tmp/mcard-source-md/esp32-s3_datasheet_en.md` | `eace7dfe7239f9005f4a329439e0d109eccb1ce3fbdbea885dc2ec6b7e36d2aa` | Used chip-level peripheral, GPIO, power, USB, RF context behind module choice. |
| Espressif ESP32-S3 test-tools PDF | `/tmp/mcard-source-downloads/esp-test-tools-en-master-esp32s3.pdf` | `225d8c1a282b1a08c09bfcb2b09c78b4bce300b519fafb1897faf67e5f28e7b1` | Not converted in this pass | n/a | Downloaded only; future production/RF test-method review. |
| Espressif ESP32-S3 AES voltage-fault-injection advisory | `/tmp/mcard-source-downloads/AR2026-005_ESP32-S3_AES_voltage_fault_injection_advisory.pdf` | `7af5035c674ce393e41752b2656cac7f30f02090e434b9be829e61c29262b450` | `/tmp/mcard-source-md/AR2026-005_ESP32-S3_AES_voltage_fault_injection_advisory.md` | `aa2502068b9a4a7ad1275efcf6ccc1b0f23e78a3b348faa390dd8d1f38c1cc57` | Used to keep ESP32-S3 security claims conservative. |
| NXP NTAG I2C plus datasheet | `/tmp/mcard-source-downloads/NT3H2111_2211.pdf` | `44a7cbee1220999138538341392aacde5a87aed7a284974328e8297b132a20c8` | `/tmp/mcard-source-md/NT3H2111_2211.md` | `aba4af7e1dced825b16cba2b045b2bc64393f8c3e02b6e7cf990892450e89282` | Used dynamic NFC fallback package, Type 2 Tag, I2C, FD, energy-harvest evidence. |
| TI BQ24074 / BQ2407x datasheet | `/tmp/mcard-source-downloads/bq24074.pdf` | `19bd875e3fada54e74efaca074335c13eb87d0537f895c3234bf77387cbf1dd8` | `/tmp/mcard-source-md/bq24074.md` | `7b21c22292ad73915dc61f082c982089fe798cfedd1b390bfe2868fa454e6f17` | Used Li-ion charger/power-path, current-limit, TS/NTC, timer, thermal evidence. |
| TI TPS63031 / TPS6303x datasheet | `/tmp/mcard-source-downloads/tps63031.pdf` | `f2d001bb75341eeb2abb00747336426f4e43b6561941167963b849293f0b1cba` | `/tmp/mcard-source-md/tps63031.md` | `ab26cc3a289575b205bd27f8292a32bcc8ee339cd677758aff9344fdf9df1495` | Used buck-boost package, inductor, layout, thermal, load-transient evidence. |

| Source | Local artifact | SHA-256 | Access classification |
|---|---|---|---|
| BuyDisplay ER-TFT020-3 product page | `/tmp/mcard-source-downloads/buydisplay_ER-TFT020-3_product.html` | `8a43303277eca3cfcfffafdb5a3ed7a3a7320391c14726a18bfb151dcfd650cc` | Download returned Cloudflare challenge HTML; not used as content evidence. |
| BuyDisplay ER-TFT020-3 direct PDF URL | `/tmp/mcard-source-downloads/ER-TFT020-3_Datasheet.pdf` | `b3d2e89e496dee4d0860f6c845b26d978ddccd3fd155a906247d8c3569094088` | Download returned HTML challenge, not PDF; `/root` local PDF remains reviewed display artifact. |
| GCT USB4105 page | `/tmp/mcard-source-downloads/gct_usb4105.html` | `d1866b2244bd06774e8e52d5872c0ef3c593fd3877a4cd9893116c72dd95961b` | Download returned Cloudflare challenge HTML; manufacturer drawing still required. |
| DigiKey USB4105-GF-A page | `/tmp/mcard-source-downloads/digikey_USB4105-GF-A.html` | `6fdc122c4729ecf9494a5ba306d1b5dd593099c72fdf425a013f54026d89405a` | Download returned Cloudflare challenge HTML; DigiKey link trusted distributor evidence, not footprint authority. |
| Hirose FH12 series page | `/tmp/mcard-source-downloads/hirose_FH12_series_ja.html` | `48b4614603911858c9b49abca3f3b91da7a60c77dd54576dcb32ee28f82a573f` | Valid manufacturer series page; exact model datasheet still required. |
| USB-IF Type-C resource page | `/tmp/mcard-source-downloads/usb_if_type_c_resources.html` | `054d20909673e86e97bbee7cfc713a9e060222e6f5e1599ae9e895b7af5870c3` | Valid standards-resource entry point; no copied spec text. |
| JLCPCB PCB capabilities | `/tmp/mcard-source-downloads/jlcpcb_pcb_capabilities.html` | `e7b89f8f8a8ee95a402dd9ff5869e25efb6b26bd969831ae0671390995e0d1f4` | Valid fabrication capability source snapshot. |
| JLC3DP design guideline | `/tmp/mcard-source-downloads/jlc3dp_design_guideline.html` | `83c25ed5fb96781f6272101898f879b99f60ad1ed550766cfdefe1f7cb945355` | Valid mechanical-process design-guideline source snapshot. |
| Japanese Law Translation Radio Act | `/tmp/mcard-source-downloads/japanese_law_translation_radio_act_4510.html` | `44a101589d31fd7152a745be0384858f0baf9d5094753d09934fc36adf114de9` | Valid legal-reference entry point; not legal advice and not certification evidence. |
| MIC technical conformity page | `/tmp/mcard-source-downloads/mic_technical_conformity.html` | `3559970027daab2155f418ef99025e3d4ba61682e8c1f6d082444d07520f7760` | Download returned MIC error page in this environment; `/root` local PDF remains reviewed MIC artifact. |
| NXP Japan NTAG I2C product page | `/tmp/mcard-source-downloads/nxp_jp_ntag_i2c_plus.html` | `e1ad137d1dd4144a72b7f17e3e6936594acaf1674caab4c6d7a2e593b7f37365` | Download returned page-not-available HTML; NXP global PDF is reviewed content evidence. |
| Alps SKRP series page | `/tmp/mcard-source-downloads/alps_skrp_series.html` | `cd97cdb49b3e8f56b449af74b437abafad7cb72877159232a180c7d0566d9a37` | Download returned access-denied XML; exact switch drawing remains `TODO: VERIFY`. |
| ST25DV04KC direct PDF URL | n/a | n/a | Direct `curl` timed out with 0 bytes after retries; keep official URL as source link and retain package/tuning TODOs. |

## Local PDF-to-Markdown conversions

Generated with `docling --to md --no-ocr --image-export-mode placeholder` on
2026-06-13. Markdown outputs are working copies under `/tmp/mcard-pdf-md` and
are not committed because they are full converted source documents.

| Source PDF | Source SHA-256 | Markdown output | Markdown SHA-256 | Review note |
|---|---|---|---|---|
| `/root/ER-TFT020-3_Datasheet.pdf` | `6f2d4448661fdf9e6084ecc4cffb7485a95da736f938c00bd0e09d4bec0cf5c2` | `/tmp/mcard-pdf-md/ER-TFT020-3_Datasheet.md` | `93f661d363d5558dd1e883fa66aaba447700b58f463af04bee1933d4dc414c47` | Used for short V1 display evidence only; do not vendor full Markdown. |
| `/root/MIC Radio Use Portal｜Conformity Certification System｜Technical Regulations Conformity Certification System.pdf` | `893672f3428f495a521f38df519efa59457785793745fdea6621d17a6d08cf34` | `/tmp/mcard-pdf-md/MIC Radio Use Portal｜Conformity Certification System｜Technical Regulations Conformity Certification System.md` | `74d3e50f91267520fc471372a4b695808b62ea43729353467eefe1a77db32dd2` | Used for short radio-certification evidence only; do not vendor full Markdown. |
