# PCB constraints

| Item | V1 rule |
|---|---|
| Outline | 46.0 x 84.0 mm planning target; corner radii `TODO: VERIFY` with enclosure |
| Thickness | 0.8 mm preferred; 1.0 mm fallback |
| Layers | Four layers preferred for return paths and RF control; stack-up `TODO: VERIFY` with JLCPCB |
| BLE | Module antenna at board edge; copy exact datasheet keepout into KiCad |
| NFC | Perimeter loop with tuning pads; exclude BLE keepout and mechanical metal |
| USB | Short differential pair, continuous reference, ESD close to receptacle |
| Power | Minimize charger/regulator hot loops; place local decoupling at pins |
| Assembly | Prefer one-side SMT where stack height and cost permit |
| Test | GND, VBAT, VBUS, 3V3, EN, BOOT, UART, USB and key buses accessible |

The 46 x 84 mm outline is the locked current PR-3 baseline. A 52 x 72 mm board
is not an accepted alternative. Any future outline change requires coordinated
updates to the envelope JSON, placement drawings, mechanical CAD, RF review,
and validator.

Do not encode guessed JLC minimums as project rules. At layout start, copy the
current selected process limits from official JLCPCB Help/capabilities and add
design margin. Verify annular rings, mask dams, via types, edge clearances,
board thickness availability, impedance service, castellations, and panel rules.

The display frame/FPC, battery pouch, buzzer, motor, screws, magnets, and case
features must not overlap the BLE keepout or NFC loop. No copper/ground/metal is
allowed in the module keepout unless the exact module datasheet explicitly
permits it.

Reserve both long edges for front-visible RGB emitters/light-guide coupling.
Keep the lower rear button row below the expanded battery keepout and out of
the USB-C insertion volume.

Use bare ENIG pogo pads for fixture access. Do not fit pin headers in the
finished thin product.
