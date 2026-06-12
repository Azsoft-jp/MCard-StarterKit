# V1 KiCad generation scaffold

This directory intentionally does not fabricate a KiCad schematic. It creates a
deterministic planning manifest that a human can use to build and review the
native KiCad project.

```bash
python3 tools/kicad-gen/generate_v1_schematic.py --output /tmp/mcard-v1-plan.json
python3 tools/kicad-gen/validate_v1_design.py
```

No third-party Python dependency is used. Direct KiCad S-expression output is
deferred until a pinned KiCad version, tested writer, symbol libraries,
footprints, and round-trip fixtures exist. Any future generated schematic must
be opened in KiCad and pass human electrical review and ERC. A generated PCB
must additionally pass DRC, footprint, antenna, mechanical, and manufacturing
review.

Future atopile adoption is reasonable after exact parts are selected. Do not
invent registry packages, footprints, or CLI flags; consult current atopile
documentation and run `ato --help`.
