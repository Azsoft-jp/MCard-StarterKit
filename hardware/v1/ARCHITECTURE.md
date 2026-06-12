# V1 architecture

```mermaid
flowchart TD
  USBC[USB-C device/sink] --> ESD[USB/ESD protection]
  ESD --> CHG[LiPo charger / power path]
  BAT[Protected LiPo] --> CHG
  CHG --> REG[3.3 V regulator]
  REG --> MCU[ESP32-S3 module]
  MCU --> TFT[240x320 SPI TFT]
  MCU --> NFC[Dynamic NFC tag over I2C]
  NFC --> LOOP[13.56 MHz perimeter loop]
  MCU --> RGB[Left/right front-visible RGB LEDs]
  MCU --> BTN[Three rear buttons]
  MCU --> PIEZO[Piezo driver]
  MCU --> VM[Optional NMOS vibration driver]
  MCU --> TP[UART/JTAG/power test pads]
```

The BLE antenna occupies one short board edge. The NFC loop uses the remaining
perimeter and includes a tuning/matching area accessible during bring-up.
Placement starts with antenna exclusions, display/FPC, USB-C, and battery,
before convenience routing.

The full placement-aware block contract, including battery connector,
backlight control, EN/BOOT, battery voltage measurement, and no-header test
access, is in `CIRCUIT_ARCHITECTURE.md`.

Firmware remains local-first and profile-driven. USB programming/debug and BLE
actions require explicit user action. NFC is a host-updatable tag, not a field
generator or reader.
