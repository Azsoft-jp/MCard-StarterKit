# V1 simulation starters

Run individually when ngspice is installed:

```bash
ngspice -b hardware/v1/simulation/power_3v3_load_step.cir
ngspice -b hardware/v1/simulation/rgb_led_current_limit.cir
ngspice -b hardware/v1/simulation/vibration_motor_driver.cir
ngspice -b hardware/v1/simulation/backlight_pwm_estimate.cir
```

The decks use deliberately simple, public-safe behavioral models so they remain
portable. Replace them with selected vendor models and measured parasitics
during design. See `charger_thermal_estimate.md` and
`nfc_loop_lumped_estimate.md` for deterministic worksheets that do not require
SPICE.

These files do not validate regulator stability, charging safety, PCB power
integrity, EMC, BLE RF, NFC antenna performance, or a JLCPCB assembly package.
All component values are estimates until their adjacent `TODO: VERIFY` gates
are closed.
