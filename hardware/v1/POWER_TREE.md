# V1 power tree

This is the PR-4 planning contract for power bring-up. It is not an approved
schematic, battery-safety analysis, or fabrication release.

```text
USB-C VBUS (5 V nominal source)
  -> input protection / ESD
  -> BQ24074-class charger and power path
       -> protected single-cell LiPo
       -> SYS rail
            -> TPS63031-class 3.3 V buck-boost
                 -> ESP32-S3 module
                 -> TFT logic and reviewed backlight path
                 -> dynamic NFC tag
                 -> optional SPI flash
                 -> RGB side lights
                 -> buttons / sensing
            -> piezo driver path, topology TODO: VERIFY
            -> optional vibration motor path, DNP by default
```

## Domain contract

| Domain | Expected consumers | Default state | Required verification |
|---|---|---|---|
| VBUS | Charger input and USB detection | Present only after user cable insertion | Connector rating, CC resistors, protection, cable current, and ESD `TODO: VERIFY` |
| VBAT | Protected LiPo and battery sense | Connected only with verified polarity | Cell supplier, protection, swelling, wiring, connector, shipping, and safety `TODO: VERIFY` |
| SYS | Charger power-path output | Charger-controlled | Operating range, supplement behavior, current limits, and transient response `TODO: VERIFY` |
| 3V3 | MCU and low-voltage peripherals | Enabled during normal operation | Regulator limits, stability, inductor, derating, peak load, and startup `TODO: VERIFY` |
| BACKLIGHT | TFT LED path | Off until firmware explicitly enables it | Ordered panel pinout, current, driver, PWM, and thermal behavior `TODO: VERIFY` |
| RGB | Side-light supply/data | Off at boot | Exact LED logic threshold, count, peak current, decoupling, and optical design `TODO: VERIFY` |
| PIEZO | Sounder drive | Off at boot | Drive voltage, frequency, transistor/topology, acoustic cavity, and EMC `TODO: VERIFY` |
| VIBRATION | Optional motor and clamp | DNP and off | Motor MPN, stall current, retention, MOSFET, clamp, EMI, and stack height `TODO: VERIFY` |

## Bring-up order

1. Inspect for shorts with the battery and display disconnected.
2. Apply a current-limited bench supply to the intended input test point.
3. Verify VBUS, SYS, and 3V3 with loads held off.
4. Verify EN/BOOT behavior and native USB recovery.
5. Bring up the ESP32-S3 with BLE, display backlight, RGB, piezo, and vibration
   disabled by default.
6. Add one load at a time while logging rail minimum, peak current, and device
   temperature.
7. Connect the protected LiPo only after polarity, charger limits, NTC
   strategy, and connector pinout pass review.

## Safety gates

- No firmware path enables the optional motor automatically.
- Backlight, RGB, and piezo outputs use defined-off startup states.
- Battery percentage in the PR-4 firmware is deterministic sample data until
  the divider, ADC pin, calibration, and cell curve are verified.
- The specific ESP32-S3 module or finished product Japan radio certification
  applicability remains `TODO: VERIFY`; module selection is not an automatic
  certification claim.
