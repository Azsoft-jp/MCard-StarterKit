# JLCPCB PCB and PCBA rules

## Sources

- Title: JLCPCB Japanese Help; URL: https://jlcpcb.com/jp/help; publisher:
  JLCPCB; accessed: 2026-06-12.
- Title: PCB Capabilities; URL:
  https://jlcpcb.com/capabilities/pcb-capabilities; publisher: JLCPCB;
  accessed: 2026-06-12.
- Title: JLCPCB Parts Library; URL: https://jlcpcb.com/parts; publisher:
  JLCPCB; accessed: 2026-06-12.

Why: these are the official process and order-time sources. Help articles take
priority over marketing summaries, and the selected quote options take priority
where capabilities vary by process.

## Extracted rules

- Generate Gerber/drill, BOM, and CPL from the same reviewed revision.
- BOM references, MPN/LCSC number, quantity, and footprint must agree with CPL.
- CPL needs designator, X/Y, side, and rotation; verify orientation in the
  assembly preview and against pin-1/polarity marks.
- Basic/extended classification and stock can change; record them at order time.
- Confirm all special processes and assembly constraints before upload.
- Add margin over manufacturing minimums rather than designing exactly to them.

## Unresolved

- `TODO: VERIFY` exact 0.8 mm four-layer stack-up, copper weights, impedance,
  minimum trace/space, via/annular ring, mask dam, edge clearance, and panel rules.
- `TODO: VERIFY` accepted BOM/CPL headers, origin and rotation behavior for the
  current JLC importer.
- `TODO: VERIFY` whether display FPC or other connectors need manual assembly.
