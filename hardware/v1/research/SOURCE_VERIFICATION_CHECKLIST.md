# V1 source verification checklist

Status: evidence template for clearing `TODO: VERIFY` items. Do not mark a
line verified until the linked source, revision/date, and reviewer are recorded.

## Use rules

- Official manufacturer, standards, regulatory, or fabrication-process sources win.
- Distributor listings are sourcing evidence, not design-rule authority.
- Community notes may be recorded as context only.
- If a source is inaccessible, stale, ambiguous, or conflicts with an official source, keep the item `TODO: VERIFY`.
- Do not copy large source text into this repository; summarize the rule and link the source.

## Required evidence fields

| Field | Required content |
|---|---|
| Block | Display, BLE, NFC, battery, USB-C, resin, PCBA, or certification |
| Candidate | Exact MPN, process, drawing, or regulation page |
| Source title | Official title shown by publisher |
| Publisher | Manufacturer, standards body, regulator, JLCPCB, JLC3DP, LCSC, or supplier |
| URL | Direct public URL where practical |
| Access date | Date evidence was checked |
| Revision/date | Document revision, publication date, or page date when available |
| Extracted rule | Short paraphrase of the design rule or dimension |
| Design impact | What changes in schematic, PCB, CAD, BOM, firmware, or test plan |
| Remaining gap | What still keeps the item `TODO: VERIFY` |
| Reviewer | Person or agent that checked it |

## Verification queue

| Block | Candidate / source target | Local action now complete | Remaining `TODO: VERIFY` gate |
|---|---|---|---|
| Display | ER-TFT020-3 drawing and sample | Display verification fields and mechanical checks are defined | Controlled drawing, measured sample, FPC pinout, backlight, lifecycle |
| Display connector | FH12-14S-0.5SH(55) or drawing-compatible alternate | Contact-side and mated-height evidence fields are defined | Exact drawing, FPC thickness, JLCPCB assembly preview |
| BLE module | ESP32-S3-MINI/WROOM datasheet and hardware design guide | Keepout evidence fields and CAD/KiCad handoff checks are defined | Exact selected module, land pattern, antenna keepout, Japan certification applicability |
| NFC dynamic tag | ST25DV preferred, NTAG I2C fallback | Preferred/fallback evidence fields are defined | Exact order suffix, package pinout, I2C behavior, LCSC/JLCPCB status |
| NFC antenna | ST/NXP antenna application notes plus assembled measurement | Measurement checklist exists in `RF_NFC_MEASUREMENT_CHECKLIST.md` | Loop geometry, tuning network, measured Q, reader interoperability |
| Battery | Protected 402025-class LiPo supplier data | Volume and safety checklist exists | Supplier, PCM/wires, swelling, charge current, safety paperwork, runtime |
| USB-C | Receptacle drawing and USB-C sink references | Insertion-volume and source fields are defined | Shell/stake dimensions, CC implementation, plug clearance |
| Resin case | JLC3DP transparent smoke resin process | Fusion 360 interference and process fields are defined | Process limits, wall/rib/snap/boss tolerance, tint, UV aging, light leakage |
| PCBA | JLCPCB/LCSC current assembly and stock evidence | BOM evidence fields are defined | Current availability, basic/extended state, footprint preview, lifecycle |
| Japan radio | MIC/technical conformity source plus exact module evidence | Explicit no-claim rule is documented | Exact module certificate applicability and finished-product review |

## Output record format

When a verification pass is completed, add a short record to the relevant
research note with this shape:

```text
Source verification:
- Block:
- Candidate:
- Source title:
- Publisher:
- URL:
- Access date:
- Revision/date:
- Extracted rule:
- Design impact:
- Remaining gap:
- Reviewer:
```

## External evidence gathered

- 2026-06-13: `SOURCE_VERIFICATION_RECORDS_2026-06-13.md` records manufacturer/official source evidence for ESP32-S3 MINI/WROOM, ESP32-S3 hardware design guidance, ER-TFT020-3, FH12, ST25DV, NTAG I2C, USB4105, USB-IF Type-C resources, BQ24074, TPS63031, JLCPCB, LCSC/JLCPCB sourcing, JLC3DP, and MIC source entry point.
- 2026-06-13: `SOURCE_VERIFICATION_RECORDS_2026-06-13.md` records dated JLCPCB parts-library observations from `tsci search --jlcpcb`.
- 2026-06-13: user-supplied source updates for BuyDisplay, Hirose, ST, NXP Japan, DigiKey, TI Japan, JLCPCB, JLC3DP, MIC, and Japanese Law Translation were recorded in `SOURCE_VERIFICATION_RECORDS_2026-06-13.md`.
- External evidence reduces source-discovery uncertainty, but does not clear sample measurement, assembled RF/NFC tuning, KiCad footprint import, Fusion 360 interference review, order-time PCBA preview, resin process selection, or Japan radio applicability.
