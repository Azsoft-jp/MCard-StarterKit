# V1 simulation starters

Run individually when ngspice is installed:

```bash
ngspice -b hardware/v1/simulation/power_3v3_load_step.cir
ngspice -b hardware/v1/simulation/rgb_led_current_limit.cir
ngspice -b hardware/v1/simulation/vibration_motor_driver.cir
```

The decks use deliberately simple behavioral models so they remain portable.
Replace them with selected vendor models and measured parasitics during design.
They do not validate regulator stability, charging safety, PCB power integrity,
EMC, BLE RF, or NFC antenna performance.

The committed decks were batch-checked with ngspice 44.2.
