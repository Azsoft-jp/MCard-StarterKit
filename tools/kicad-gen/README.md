# V1 KiCad generation scaffold

This directory generates a deterministic, note-only KiCad 9 schematic scaffold.
It is a starter structure for human schematic capture, not an electrically
verified design. The generated schematic contains no symbols, nets, pin
mappings, or assigned footprints.

No third-party Python package is required.

## Generate

From the repository root:

```bash
python3 tools/kicad-gen/generate_v1_schematic.py
python3 tools/kicad-gen/validate_v1_design.py
```

The generator writes:

- `hardware/v1/kicad/MCard_V1.kicad_pro`
- `hardware/v1/kicad/MCard_V1.kicad_sch`

Use `--manifest /tmp/mcard-v1-plan.json` to emit a machine-readable planning
summary in addition to the KiCad files.

## Overwrite behavior

Generation is deterministic. Existing files with identical content are left
unchanged. If an existing generated file differs, the command refuses to
overwrite it. After reviewing the difference, `--force` creates a timestamped
`.bak-YYYYMMDDTHHMMSSZ` copy beside each changed file before writing.

Use this in CI or local verification without writing:

```bash
python3 tools/kicad-gen/generate_v1_schematic.py --check
```

## Validation boundary

The validator checks file presence, required section labels, review warnings,
`TODO: VERIFY` coverage, deterministic generator output, and clean-room asset
boundaries. When `kicad-cli` is installed, also run:

```bash
kicad-cli sch erc hardware/v1/kicad/MCard_V1.kicad_sch \
  --output /tmp/MCard_V1-erc.rpt
```

A parser-clean file or empty ERC report does not establish electrical
correctness because this scaffold intentionally has no circuit. Before adding
symbols or nets, verify the exact datasheet pinout, footprint, assembly status,
power design, RF keepouts, and DNP behavior. Any populated schematic requires
human electrical review and a recorded ERC disposition before PCB work.
