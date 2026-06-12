# V1 BOM review checklist

Use this checklist before the BOM gate, again before schematic release, and
again before a JLCPCB order. Checkboxes are evidence prompts, not automatic
approval.

## Review record

- Review date:
- Reviewed commit:
- Reviewer:
- Schematic revision:
- PCB revision:
- JLCPCB quote/process:
- Open `TODO: VERIFY` count:
- Result: PASS / FAIL / CONDITIONAL

## LCSC availability gate

- [ ] Every populated line has a complete manufacturer name, exact MPN, package,
  and LCSC code.
- [ ] Stock, lifecycle, minimum order, price break, and basic/extended class were
  checked in the current official parts library.
- [ ] The check date and reviewer are recorded.
- [ ] MCU, NFC, charger, regulator, USB connector, USB ESD, FPC connector, and
  display have a reviewed fallback or a documented single-source exception.
- [ ] Duplicate marketplace records were resolved to one controlled LCSC code.
- [ ] DNP and manually installed parts are identified separately.
- [ ] No order proceeds with a critical part marked `TODO: VERIFY`.

Gate result: PASS / FAIL

## JLCPCB assembly package gate

- [ ] Each SMT package is supported on the selected assembly side and process.
- [ ] Exposed pads, thermal vias, bottom terminations, connector stakes, and
  module overhang are reviewed in current JLC guidance and quote output.
- [ ] BOM and CPL designators match exactly.
- [ ] Rotation, pin 1, polarity, LED emission direction, connector opening, and
  module antenna direction were inspected in the assembly preview.
- [ ] 0402 parts are used only where assembly and inspection are practical.
- [ ] Manual steps for display, battery, piezo, and optional motor are documented.
- [ ] Customer-supplied part requirements, if any, are explicitly accepted.

Gate result: PASS / FAIL

## Datasheet / footprint gate

- [ ] Every symbol pin is checked against the current manufacturer datasheet.
- [ ] Every footprint is checked against the manufacturer package drawing.
- [ ] ESP32 module land pattern, antenna overhang, keepout, and height are exact.
- [ ] Display FPC count, pitch, contact side, thickness, pin 1, tail datum, and
  connector insertion direction match the ordered panel.
- [ ] ST25DV order suffix is mapped to the intended SO8N package and pinout.
- [ ] USB ESD package metadata conflict is resolved using the TI drawing and
  exact LCSC manufacturer record.
- [ ] Charger/regulator exposed pads, stencil, and thermal-via strategy match
  datasheet guidance.
- [ ] JST header, mating housing, contacts, cable gauge, and polarity are one
  controlled harness definition.
- [ ] KiCad courtyard, paste, mask, and 3D body were visually reviewed.
- [ ] A human electrical review is recorded before generated artifacts are used.

Gate result: PASS / FAIL

## Antenna keepout gate

- [ ] BLE module antenna is at the board edge with the exact datasheet keepout.
- [ ] No copper, ground plane, battery, display metal, USB shell, fastener,
  motor, piezo, light-guide metal, or enclosure metal violates the BLE keepout.
- [ ] NFC loop does not enter the BLE keepout.
- [ ] NFC loop, matching area, 0 ohm links, and VNA pads are reserved.
- [ ] Battery, display frame, USB shell, copper pours, side LEDs, and resin
  features are included in the NFC tuning review.
- [ ] No aluminum case assumption is present in V1.
- [ ] Assembled NFC inductance/Q measurement and reader interoperability plan
  are documented.
- [ ] RF review states that ngspice cannot validate BLE or NFC antennas.

Gate result: PASS / FAIL

## Power budget gate

- [ ] Peak and average loads cover ESP32 radio, TFT logic, backlight, RGB LEDs,
  NFC, external flash, piezo, charger/system path, and optional motor.
- [ ] Regulator output current, input range, efficiency, inductor saturation,
  load transient, thermal rise, and stability are checked.
- [ ] Charger input limit and charge current are derived from USB policy,
  enclosure thermal limits, and the exact cell datasheet.
- [ ] Protected-cell strategy, NTC strategy, low-voltage behavior, and use while
  charging are documented.
- [ ] Backlight voltage/current and RGB LED supply/data thresholds are verified.
- [ ] Motor stall current, flyback path, PWM policy, and DNP defaults are verified
  if vibration is included.
- [ ] Rail test pads and brownout/recovery tests are defined.

Gate result: PASS / FAIL

## Thickness gate

- [ ] The maximum target remains 8.5 mm; no 6.7 mm final-thickness claim is used.
- [ ] WROOM-1-N16R8 body and antenna keepout fit the current floorplan, or the
  MINI-1-N4R2 fallback decision is recorded.
- [ ] Display, stiffener, FPC bend, connector, adhesive, lens, and tolerances fit
  the display region.
- [ ] Battery pouch, seal, PCM, wires, connector, insulation, adhesive, and
  swelling allowance fit the battery region.
- [ ] Charger, regulator inductor, USB-C shell, switches, piezo, RGB optics, and
  optional motor are checked in the STEP stack.
- [ ] Display and battery do not overlap in XY.
- [ ] No sharp, hot, or replaceable hardware bears on the pouch cell.
- [ ] PCB stackup/thickness is selected from current JLCPCB options.
- [ ] Resin bosses, NPTHs, adhesive, or nylon fasteners pass interference review.

Gate result: PASS / FAIL

## Japan radio certification note gate

- [ ] The exact module MPN is frozen before certification research.
- [ ] Certification evidence is from an official Espressif or Japanese
  government source and identifies the exact module/product applicability.
- [ ] The design does not infer certification from the ESP32-S3 SoC family.
- [ ] Antenna type, module placement, enclosure, and allowed modifications are
  compared with the certification conditions.
- [ ] Product labeling, documentation, and test obligations are assigned.
- [ ] Until verified, all documents state `TODO: VERIFY` and make no claim that
  the module or finished badge is Japan radio-certified.

Gate result: PASS / FAIL

## Decision Pending closure

- [ ] Exact ESP32-S3 module package
- [ ] Exact display FPC pinout
- [ ] Exact NFC tag part
- [ ] Battery connector style
- [ ] Regulator topology
- [ ] Vibration motor inclusion
- [ ] RGB LED package
- [ ] PCB stackup/thickness

## Pre-schematic release

- [ ] `BOM_CANDIDATES.md` and `lcsc-bom-shortlist.csv` agree.
- [ ] Each preferred part has a source link and explicit unresolved items.
- [ ] GPIO allocation avoids unresolved straps and preserves USB recovery.
- [ ] DNP states are electrically safe and visible in the schematic.
- [ ] Test pads cover recovery, rails, buses, and switched loads.
- [ ] Open risks are copied into the schematic review issue or review record.
- [ ] The release is labeled prototype-only and not approved for production.
