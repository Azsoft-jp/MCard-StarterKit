# JLCPCB PCBA handoff

Before upload:

- Select the exact PCB process and copy current limits from JLCPCB Help.
- Export Gerbers and drill files in a standard, reviewed coordinate system.
- Match BOM designators to CPL designators; no duplicated or missing references.
- Use manufacturer part numbers and verified LCSC numbers, not descriptions alone.
- Confirm top/bottom side, X/Y origin, rotation, polarity, pin 1, and centroid.
- Review every substituted/basic/extended part and assembly surcharge.
- Inspect the online Gerber and PCBA placement previews at high zoom.
- Confirm special handling for FPC, USB-C, module, NFC IC, LEDs, buttons, and
  any through-hole/manual assembly.
- Archive the exact order package and source revision in `jlcpcb/`.

`TODO: VERIFY` all current service limits, accepted file headers, rotation
conventions, part availability, economic assembly quantity, and panel rules
against the official Japanese Help pages immediately before ordering.
