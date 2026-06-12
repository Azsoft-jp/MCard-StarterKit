# RF and antenna layout notes

## Official sources

- Espressif ESP32-S3 Hardware Design Guidelines:
  https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/index.html
- Selected WROOM/MINI module datasheet links in `ESP32S3_HARDWARE_NOTES.md`.
- ST/NXP antenna resources in `NFC_DYNAMIC_TAG_NOTES.md`.

Publishers: Espressif, ST, NXP; accessed: 2026-06-12.

## Rules

- Place the BLE module antenna at the board edge and implement the exact
  datasheet keepout in copper, components, battery, display, and enclosure.
- Keep the NFC perimeter loop outside the BLE keepout and separate its tuning area.
- Do not route noisy clocks, display edges, switching power loops, or USB through
  either antenna region.
- Resin is required for V1 near antennas. Metal enclosure work is deferred.
- Review the complete assembled stack, not only bare PCB artwork.
- ngspice lumped models cannot validate either antenna.

Unresolved: `TODO: VERIFY` final floorplan, coexistence spacing, return-current
effects, matching/tuning values, test fixture, lab method, and acceptance limits.
