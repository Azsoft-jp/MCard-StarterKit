# Charger thermal estimate worksheet

This worksheet is for first-order screening only. The selected BQ24074-class
part, configuration, package, exposed-pad layout, copper area, airflow, charge
current, input voltage, battery voltage, and ambient are all `TODO: VERIFY`.

For a linear charging interval, begin with:

```text
Pcharger ~= (Vinput - Vbattery) * Icharge + Pquiescent
Tjunction ~= Tambient + Pcharger * thetaJA_effective
```

Do not use a generic datasheet `thetaJA` as a final board result. Effective
thermal resistance depends strongly on the reviewed PCB stack, exposed-pad
connection, vias, copper, enclosure, and nearby heat sources.

## Synthetic sensitivity cases

Assume 5.0 V input and 3.5 V battery only to make the arithmetic reproducible:

| Assumed charge current | Estimated pass loss, excluding quiescent power |
|---:|---:|
| 0.10 A | 0.15 W |
| 0.20 A | 0.30 W |
| 0.30 A | 0.45 W |

These are not approved charge-current settings. `TODO: VERIFY` the protected
cell's permitted charge current, charger programming resistors, USB source
budget, thermal regulation behavior, timer/safety configuration, NTC strategy,
and worst-case low-battery condition before selecting a value.

Bench validation must measure input current, battery current, package/board
temperature, ambient, and thermal-regulation behavior inside the resin case.
