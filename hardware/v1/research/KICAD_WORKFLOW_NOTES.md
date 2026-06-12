# KiCad workflow notes

## Sources

- Title: KiCad 9 Documentation; URL: https://docs.kicad.org/9.0/; publisher:
  KiCad project; accessed: 2026-06-12.
- Title: ngspice manual; URL: https://ngspice.sourceforge.io/docs.html;
  publisher: ngspice project; accessed: 2026-06-12.

## Workflow

1. Freeze the KiCad major version and commit native text project files.
2. Build schematic hierarchically by power, MCU/USB, display, NFC, UI, and test.
3. Assign only verified symbols/footprints and attach datasheet/MPN fields.
4. Run ERC and resolve or justify every marker.
5. Import the reviewed 46 x 84 mm outline and mechanical keepouts.
6. Floor-plan antennas first, then power, display/FPC, USB, and remaining I/O.
7. Run DRC, inspect 3D, export STEP, then generate reviewed fabrication outputs.

KiCad's simulator integrates ngspice, but models frequently need pin mapping and
syntax adaptation. The supplied `.cir` files are standalone starter models.
Generated S-expressions are not trusted without opening, ERC/DRC, and human review.

Unresolved: `TODO: VERIFY` final KiCad version, official library revisions,
custom symbol/footprint ownership, and CI availability of `kicad-cli`.
