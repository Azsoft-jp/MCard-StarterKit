# Simulation plan

Starter netlists cover:

- 3.3 V rail load-step sensitivity to source impedance, ESR, and capacitance.
- RGB LED resistor current at representative supply/forward voltages.
- Optional vibration motor low-side NMOS switching and flyback behavior.

Run with `ngspice -b <file.cir>` when ngspice is installed. These behavioral
models are educational estimates and do not replace vendor models, bench
measurement, regulator stability analysis, thermal testing, or EMC work.

Additional work:

- `TODO: VERIFY` charger dissipation using selected charge current, battery
  voltage, USB input, package thermal resistance, copper area, and ambient.
- Model the NFC loop only as lumped L/R/C for an initial tuning worksheet.
- Do not claim RF/NFC validation from ngspice. Final NFC tuning needs measured
  inductance/Q and qualified RF review; BLE needs module/layout compliance and
  radiated testing.
