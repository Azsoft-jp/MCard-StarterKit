# V1 PCBA selection rules

These rules control the move from the candidate BOM to a KiCad schematic and a
future JLCPCB assembly order. They do not authorize an order and they do not
replace the current JLCPCB quote, parts library, or assembly preview.

## Source priority

1. Manufacturer datasheet, package drawing, errata, and product-change notice.
2. JLCPCB parts library and order preview for assembly eligibility.
3. LCSC product page for exact manufacturer, MPN, package, stock, and lifecycle.
4. KiCad library content only after comparison with the manufacturer drawing.
5. Community libraries or forum advice only as a lead, never as footprint proof.

When sources disagree, stop the part at `TODO: VERIFY`. Marketplace package text
must not override a manufacturer drawing.

## Selection rules

- Lock manufacturer, complete MPN, package suffix, LCSC number, and lifecycle.
- Record the observation date for stock and basic/extended classification.
- Recheck stock and assembly class at schematic freeze and immediately before
  order upload. A dated shortlist is not a reservation.
- Prefer basic parts for common passives where the electrical requirement is
  unchanged. Accept extended parts for modules, NFC, connectors, and power ICs
  when the preferred architecture justifies them.
- Use 0402 for dense, low-profile passives that JLC routinely assembles. Use
  0603 where hand tuning, probe access, voltage rating, or first-build rework is
  more important than area.
- Keep NFC tuning, SPI damping, optional flash, and vibration parts DNP-capable.
  A DNP line still needs a reviewed footprint and a defined default connection.
- Do not treat alternates as drop-in until pinout, footprint, ratings, firmware,
  thermal behavior, RF behavior, and mechanical envelope are compared.
- Prefer one-side SMT where it does not violate antenna, display, battery, or
  optical constraints. Record any hand-installed display, battery, buzzer, or
  motor operation separately from the PCBA quote.
- Use manufacturer-recommended exposed-pad and thermal-via patterns for charger
  and regulator ICs. Confirm JLC stencil and via handling in the order preview.
- Do not create a footprint from a product photo or another distributor's
  nominal package label.

## Block-specific rules

### MCU and radio

- Start the schematic with ESP32-S3-WROOM-1-N16R8.
- Retain ESP32-S3-MINI-1-N4R2 as a separately reviewed compact fallback.
- Do not use `ESP32-S3-MINI-1-N8R8`; it is not listed in the current official
  MINI datasheet.
- Copy the exact module land pattern, antenna overhang, and keepout into KiCad.
- Resolve every strap pin, native USB pin, EN/BOOT circuit, and test connection
  before assigning display, NFC, LED, or button GPIOs.
- Do not claim Japan radio certification. Record exact certification
  applicability from an official source as a release gate.

### Display and FPC

- Order the candidate panel and obtain its controlled drawing before releasing
  the connector footprint.
- Verify 14-pin count, 0.5 mm pitch, exposed-contact side, FPC thickness,
  insertion direction, pin 1, tail bend, stiffener, and backlight pins.
- Treat the panel as a manually installed item unless the JLC quote explicitly
  supports the chosen assembly operation.
- A substitute display requires a full pinout, geometry, controller, init
  sequence, backlight, and lifecycle review.

### NFC

- V1 uses a dynamic tag only. Do not add an NFC reader IC.
- Select ST25DV04KC-IE6S3 before fixing symbol pins or antenna network.
- Keep the NTAG I2C plus fallback as a separate symbol, footprint, and firmware
  path rather than forcing a common package abstraction.
- Reserve configurable series/shunt tuning positions, 0 ohm links, and
  measurement pads. Initial tuning values may be DNP.
- Measure loop inductance and Q in the assembled product. Battery, display
  metal, USB shell, copper, and enclosure details are part of the RF system.

### Power and battery

- Build a peak and average power budget before freezing the regulator topology.
- Set charge current from the exact cell datasheet, not charger capability.
- Review USB input limit, use-while-charging behavior, charger thermal rise,
  battery protection, NTC strategy, cable polarity, and pouch swelling volume.
- Keep charger, regulator, inductor, and motor loops away from BLE and NFC
  regions. Do not place hot or sharp features against the pouch cell.
- The battery connector and harness are one controlled assembly. Record housing,
  contacts, wire gauge, polarity, and strain relief together.

### USB

- Implement a USB 2.0 device/sink subset only: VBUS, GND, D+/D-, and separate
  5.1 kOhm Rd resistors on CC1 and CC2.
- Do not advertise USB-PD or host behavior.
- Put the ESD device adjacent to the receptacle with a short ground path.
- Verify D+/D- continuity and orientation through the selected ESD package.

### UI and optional loads

- Confirm RGB LED supply and data thresholds before choosing an addressable part.
- Limit LED current in hardware assumptions and firmware policy.
- Keep the vibration motor DNP until stack, stall current, EMI, and retention
  tests pass. The driver and flyback path must also be DNP-safe.
- Verify piezo drive amplitude, acoustic port, and enclosure resonance with a
  real sample.
- Avoid ESP32 strapping pins for user buttons unless the boot behavior is
  explicitly proven.

## BOM and CPL handoff

- Generate Gerber/drill, BOM, and CPL from the same reviewed commit.
- BOM and CPL designators must match exactly.
- Use the complete MPN and verified LCSC number in the order BOM.
- Check side, X/Y origin, rotation, pin 1, polarity, connector opening, LED
  emission direction, and module antenna direction in the assembly preview.
- Record all DNP designators and exclude them intentionally rather than deleting
  their schematic intent.
- Archive only public-safe manifests. Do not commit credentials, private order
  identifiers, or unreviewed production packages.

## Package defaults

| Item | Preferred | Fallback | Rule |
|---|---|---|---|
| General resistors/capacitors | 0402 | 0603 | Use 0603 for hand tuning, higher rating, or first-build access |
| NFC tuning capacitors | 0402 C0G/NP0 | 0603 C0G/NP0 | Value remains TBD until antenna measurement |
| SPI series resistors | 0402 | 0603 | Place near source and permit DNP/direct configuration |
| Power passives | Datasheet-selected | Larger reviewed package | Current, saturation, DC bias, thermal, and height control selection |
| Test access | Bare ENIG pads | Low-profile SMT point | Prefer no added height |

## Order-time record

Before each quote, record:

- date and reviewer
- JLCPCB assembly side and process
- exact PCB thickness, layer stack, copper, finish, and special options
- each critical LCSC code, stock, lifecycle, and basic/extended class
- customer-supplied or manually installed parts
- BOM/CPL importer warnings and resolved substitutions
- assembly preview screenshots or review notes kept outside private order data
- explicit no-order status for every unresolved `TODO: VERIFY`
