# V1 simulation plan

These simulations are deterministic planning aids for PR-4. They use synthetic
stimuli and first-order components so they can run locally without proprietary
vendor models.

| Model | Question | Deterministic output | Release limitation |
|---|---|---|---|
| `power_3v3_load_step.cir` | How sensitive is a synthetic 3.3 V rail to a 0.08 A to 0.65 A load step? | `VMIN`, `VMAX` | Replace all source, ESR, capacitance, regulator, and load assumptions. |
| `rgb_led_current_limit.cir` | What current range results from a sample resistor and diode model? | `ILED_MAX` | The selected side-emitter is addressable; this deck is only a current-path sanity check. |
| `vibration_motor_driver.cir` | Does the sample low-side switch include gate bias and a clamp path? | `IMOTOR_MAX` | Motor remains DNP; verify motor winding, stall current, MOSFET, and clamp. |
| `backlight_pwm_estimate.cir` | What is the average current of a synthetic PWM-switched backlight path? | `IAVG`, `IMAX` | Replace with the ordered panel backlight topology and ratings. |
| `charger_thermal_estimate.md` | How should charger dissipation and junction rise be calculated? | Worksheet equations and sample cases | Requires the exact charger configuration and PCB thermal data. |
| `nfc_loop_lumped_estimate.md` | What first-order capacitance follows from an assumed loop inductance? | Lumped resonance worksheet | Not an RF or NFC antenna validation. |

Run the decks with:

```bash
for deck in hardware/v1/simulation/*.cir; do
  ngspice -b "$deck"
done
```

## Acceptance gates

- Every deck parses and exits successfully in batch mode.
- Measured values are finite and the deck contains no external model path.
- Results are recorded as estimates, not component guarantees.
- `TODO: VERIFY` the selected regulator vendor model, stability criteria,
  inductor saturation current, capacitor bias derating, and PCB parasitics.
- `TODO: VERIFY` charger current, thermal limits, battery safety requirements,
  NTC strategy, and the final power-path behavior.
- `TODO: VERIFY` display backlight current, driver topology, PWM frequency,
  audible behavior, and optical performance.
- `TODO: VERIFY` assembled NFC loop inductance, resistance, Q, tuning, metal
  loading, and reader interoperability.

ngspice cannot validate BLE RF performance or the distributed behavior of the
NFC loop. Final BLE work requires compliance with the exact module design
rules and radiated testing. Final NFC work requires assembled measurement and
qualified RF review.
