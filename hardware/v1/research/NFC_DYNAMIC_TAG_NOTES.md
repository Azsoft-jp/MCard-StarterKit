# Dynamic NFC tag notes

## Sources

- ST25DV04KC product support: https://www.st.com/en/nfc/st25dv04kc.html
- ST NFC antenna design resources: https://www.st.com/en/nfc/st25-nfc-rfid-tags-readers.html
- NXP NTAG I2C plus:
  https://www.nxp.com/products/rfid-nfc/nfc-hf/connected-nfc-tags/ntag-i2c-plus-2k-nfc-forum-type-2-tag-with-i2c-interface:NTAG_I2C

Publishers: STMicroelectronics and NXP; accessed: 2026-06-12. Product support
pages lead to current datasheets/application notes; those documents govern the
actual circuit and antenna.

## Rules

- V1 is a dynamic tag only: I2C host plus passive 13.56 MHz interface.
- Select IC/package before schematic and follow its supply, pull-up, field
  detection, energy harvesting, ESD, and antenna connection guidance.
- Reserve a perimeter loop, tuning/matching footprints, measurement access, and
  multiple capacitor options.
- Measure fabricated inductance and Q in the assembled mechanical environment.
- Battery, display frame, ground/copper, USB shell, and future metal can detune
  or shield the loop.

Unresolved: `TODO: VERIFY` exact ST/NXP order code, capacitance model, target
inductance/Q, loop geometry, tuning method, reader interoperability, and LCSC status.
