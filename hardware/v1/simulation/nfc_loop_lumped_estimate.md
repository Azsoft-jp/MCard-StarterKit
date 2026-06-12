# NFC loop lumped estimate

The V1 dynamic-tag loop is a distributed RF structure around the board edge.
This worksheet is only an initial L/R/C sensitivity check. ngspice cannot
validate the real antenna, reader coupling, Q, field strength, metal loading,
or protocol interoperability.

For a first-order isolated resonance:

```text
f0 = 1 / (2 * pi * sqrt(L * C))
C  = 1 / ((2 * pi * f0)^2 * L)
```

At 13.56 MHz, a deliberately synthetic 2.0 uH loop assumption gives about
68.9 pF before IC input capacitance, PCB parasitics, tuning tolerance, and
assembled-product loading. This is not a component selection.

## Required measured inputs

- Loop inductance and series resistance on the fabricated PCB.
- Dynamic-tag input capacitance and allowed tuning topology from the exact
  current datasheet.
- Matching/tuning component tolerance and temperature behavior.
- Battery, display, cable, enclosure, hand, and fixture loading.
- Detour around the BLE keepout, USB-C, bosses, RGB optics, and strap load path.

`TODO: VERIFY` the exact loop geometry, copper width/spacing, layer, ground
exclusions, tuning links, measurement pads, ESD strategy, assembled Q, and
reader interoperability with qualified RF review.
