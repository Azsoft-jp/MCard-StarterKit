# V1 schematic review checklist

This checklist applies to the generated starter/scaffold and every later
populated revision. It does not certify electrical correctness, safety,
manufacturability, or regulatory compliance.

## Review record

- Review date:
- Reviewed commit:
- KiCad version:
- Reviewer:
- Schematic revision:
- Open `TODO: VERIFY` count:
- ERC report:
- Result: PASS / FAIL / CONDITIONAL

## Generated scaffold boundary

- [ ] The title block still says the file is a generated starter/scaffold
  requiring human electrical review.
- [ ] Generated notes have not been mistaken for verified circuit content.
- [ ] Exact symbols, footprints, pin mappings, and nets are added only from
  current primary-source documentation.
- [ ] Generator changes reproduce deterministically with `--check`.
- [ ] Any forced overwrite has a reviewed timestamped backup.

## Part and assembly verification

- [ ] Every populated part has an exact manufacturer, MPN, package, and source.
- [ ] `TODO: VERIFY` exact footprint is closed against the package drawing.
- [ ] `TODO: VERIFY` datasheet-confirmed pinout is closed pin by pin.
- [ ] `TODO: VERIFY` JLCPCB assembly status is checked in the current order
  preview, including basic/extended class, side, rotation, and pin 1.
- [ ] DNP and manual-install states are electrically safe and visible.
- [ ] Connector contact side, insertion direction, polarity, and mating part are
  independently reviewed.

## Power and USB ERC review

- [ ] VBUS, VBAT, system output, and 3V3 use distinct net names.
- [ ] Charger input limit, charge current, TS/NTC strategy, exposed pad, and
  power-path behavior match the exact cell and charger datasheets.
- [ ] Regulator input range, inductor, decoupling, enable state, load transient,
  thermal behavior, and peak load budget are reviewed.
- [ ] USB-C CC1 and CC2 each use the reviewed sink pull-down arrangement.
- [ ] USB D+/D- connector pins, ESD pinout, shield, and return path are checked.
- [ ] Power-input and power-output ERC pin types are intentional.
- [ ] Power flags are added only where the real source is understood.

## MCU, buses, and loads

- [ ] ESP32-S3 power pins, decoupling, EN, BOOT, strapping pins, USB pins, UART,
  and unused-pin policy match the exact module datasheet.
- [ ] GPIO allocation avoids boot-strap conflicts and preserves recovery.
- [ ] EN/BOOT/reset behavior and native USB programming/debug recovery are
  explicitly represented and reviewed.
- [ ] TFT FPC pin order, SPI signals, logic voltage, backlight current, and
  connector orientation match the ordered display sample.
- [ ] NFC tag package pinout, I2C address, pull-ups, GPO/FD, energy-harvest
  decision, decoupling, and RF pins match the exact order code.
- [ ] Optional SPI NOR is safe when DNP and does not conflict with boot or TFT
  buses.
- [ ] RGB LED supply, data threshold, direction, current budget, and decoupling
  are verified.
- [ ] Buttons have defined idle states, debounce intent, and no unsafe strap
  interaction.
- [ ] Piezo and optional motor drivers have defined off states and reviewed
  voltage/current limits.
- [ ] Motor flyback or clamp strategy is derived from the selected motor and
  switching mode.
- [ ] Battery voltage measurement range, divider leakage, ADC source
  impedance, filtering, calibration, and safe behavior are reviewed.

## Antenna and layout handoff

- [ ] ESP32-S3 module is at a board edge with the exact datasheet antenna
  keepout recorded in KiCad.
- [ ] No copper, plane, battery, display metal, connector shell, fastener, motor,
  or enclosure metal violates the BLE keepout.
- [ ] NFC loop does not enter the BLE keepout.
- [ ] NFC loop, matching placeholders, links, and measurement pads are present.
- [ ] NFC tuning remains marked for assembled-hardware measurement.
- [ ] Test pads cover GND, VBUS, VBAT, 3V3, EN, BOOT, UART, USB, I2C, SPI, and
  switched-load diagnostics without compromising signal integrity.
- [ ] Test pads remain accessible to a pogo fixture after case removal and no
  pin headers are fitted in the thin product.
- [ ] Display FPC direction, USB-C opening, button axes, RGB light guides,
  piezo cavity, optional motor volume, and battery keepout match
  `PLACEMENT_DEPENDENCIES.md`.

## ERC disposition

- [ ] KiCad ERC was run on the reviewed commit.
- [ ] Every error and warning is fixed or has a written engineering
  justification.
- [ ] No-connect markers represent deliberate unused pins.
- [ ] Hidden power pins and multi-unit symbols were inspected.
- [ ] Net labels do not create unintended global connections.
- [ ] Passive-pin warnings are not broadly suppressed.
- [ ] The ERC report and reviewer are recorded above.

Gate result: PASS / FAIL / CONDITIONAL
