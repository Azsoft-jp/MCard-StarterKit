# LCSC BOM rules

## Sources

- Title: LCSC FAQ; URL: https://www.lcsc.com/faqs; publisher: LCSC; accessed:
  2026-06-12.
- Title: JLCPCB Parts Library; URL: https://jlcpcb.com/parts; publisher:
  JLCPCB; accessed: 2026-06-12.

Why: procurement and PCBA eligibility are volatile and cannot be inferred from
a family name or old search result.

## Rules

- Lock exact manufacturer, MPN, package, and LCSC number.
- Check stock, lifecycle/EOL/NRND status, minimum order, price breaks, moisture
  sensitivity, and JLC basic/extended status at BOM gate and again pre-order.
- Keep a functionally reviewed alternate for critical power, MCU, NFC, USB, and
  display parts. An alternate is not drop-in until pinout, footprint, ratings,
  firmware, and layout are checked.
- Datasheets and manufacturer PCNs outrank marketplace descriptions.
- Do not publish a confident LCSC number when it has not been verified live.

## Unresolved

All shortlist rows remain `TODO: VERIFY` until checked in the current parts
library. Record date, stock location, lifecycle evidence, and assembly class.
