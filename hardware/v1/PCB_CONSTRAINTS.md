# PCB constraints

| Item | V1 rule |
|---|---|
| Outline | 52.0 x 72.0 mm; corner radii `TODO: VERIFY` with enclosure |
| Thickness | 0.8 mm preferred; 1.0 mm fallback |
| Layers | Four layers preferred for return paths and RF control; stack-up `TODO: VERIFY` with JLCPCB |
| BLE | Module antenna at board edge; copy exact datasheet keepout into KiCad |
| NFC | Perimeter loop with tuning pads; exclude BLE keepout and mechanical metal |
| USB | Short differential pair, continuous reference, ESD close to receptacle |
| Power | Minimize charger/regulator hot loops; place local decoupling at pins |
| Assembly | Prefer one-side SMT where stack height and cost permit |
| Test | GND, VBAT, VBUS, 3V3, EN, BOOT, UART, USB and key buses accessible |

Do not encode guessed JLC minimums as project rules. At layout start, copy the
current selected process limits from official JLCPCB Help/capabilities and add
design margin. Verify annular rings, mask dams, via types, edge clearances,
board thickness availability, impedance service, castellations, and panel rules.

The display frame/FPC, battery pouch, buzzer, motor, screws, magnets, and case
features must not overlap the BLE keepout or NFC loop. No copper/ground/metal is
allowed in the module keepout unless the exact module datasheet explicitly
permits it.
