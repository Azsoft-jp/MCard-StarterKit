# ESP32-S3 hardware notes

## Sources

- ESP32-S3 Hardware Design Guidelines:
  https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/index.html
- ESP32-S3-WROOM-1 datasheet:
  https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf
- ESP32-S3-MINI-1 datasheet:
  https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf

Publisher: Espressif; accessed: 2026-06-12. These control supply, reset,
strapping, USB, land pattern, antenna placement, dimensions, and variants.

## Design rules

- Size 3.3 V for radio/display transients and place required decoupling close.
- Review EN/reset timing and every strapping pin before assigning peripherals.
- Route native USB D+/D- as a short referenced pair with reviewed ESD placement.
- Put the PCB-antenna module at an edge and reproduce its exact keepout.
- Follow the selected module's recommended land pattern and reflow guidance.
- N16R8 WROOM remains the preferred target pending current orderable/certification check.
- Do not call `ESP32-S3-MINI-1-N8R8` valid without an official variant listing;
  use an officially documented MINI variant or WROOM fallback.

Unresolved: `TODO: VERIFY` module revision, peak current budget, GPIO matrix,
strap conflicts, USB programming flow, antenna keepout dimensions, LCSC status,
and exact Japan certification applicability.
