# Hardware bring-up checklist

## Power

- Confirm no short between VBAT, 3V3 and GND.
- Power from current-limited bench supply first.
- Verify charger behavior before installing battery.

## MCU / BLE SoC

- Confirm reset line.
- Confirm programming/debug interface.
- Confirm crystal/clock startup if used.
- Confirm BLE advertising with a test firmware.

## Display

- Confirm backlight current.
- Confirm display reset and command bus.
- Run solid color test.
- Run frame-rate and tearing test.

## Storage

- Confirm flash or filesystem area.
- Run read/write/erase endurance smoke test.

## Safety

- Do not ship without enclosure, battery, charging, thermal and regulatory review.
