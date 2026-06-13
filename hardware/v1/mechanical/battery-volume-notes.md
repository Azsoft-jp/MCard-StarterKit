# V1 battery volume notes

Status: protected LiPo volume planning, not a battery approval.

## Baseline

- Battery stays in the lower rear region.
- Battery volume may use the 8.5 mm rear-only depth.
- Battery keepout remains separated from the upper display keepout in XY.
- Current planning direction is a protected 402025, 150-165 mAh class LiPo.

## Volume rules

- Model expanded keepout, not just nominal pouch size.
- Include pouch seal, PCM, wire/connector exit, insulation, adhesive, swelling allowance, and assembly clearance.
- Keep sharp solder, hot charger/regulator copper, exposed conductive edges, screws, clips, and replaceable fasteners away from the pouch.
- Keep battery foil and harness out of the exact ESP32-S3 antenna keepout and away from the NFC loop unless included in assembled tuning.
- Keep USB-C shell and plug insertion volume separated from the battery volume.

## Open TODO: VERIFY items

- Exact battery supplier, cell datasheet, protection circuit, wire exit, polarity, thickness tolerance, swelling allowance, shipping/safety documents, and lifecycle.
- Charge current, thermal rise, NTC/protected-cell strategy, low-voltage cutoff behavior, runtime, and enclosure temperature.
- Adhesive, insulation, strain relief, service loop, crush/drop response, and no-sharp-edge inspection.
