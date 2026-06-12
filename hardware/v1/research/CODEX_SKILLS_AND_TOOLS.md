# Codex skills and tools report

Accessed: 2026-06-12.

## Available and used

| Skill/tool | Use |
|---|---|
| `pcb-as-code` at `~/.codex/skills/pcb-as-code/` | Applied official-source discipline, RF/NFC gates, manufacturing handoff, KiCad review honesty, and `TODO: VERIFY` policy |
| Official `tscircuit` skill at `~/.codex/skills/tscircuit/` | Current tscircuit syntax, CLI, workflow, and checklist reference |
| Git and GitHub connector | Repository/branch inspection and authenticated repository access |
| GitHub CLI 2.46.0 | Authenticated and used for branch/PR publication |
| Python 3 standard library | Dependency-free generator/validator scaffold |
| PlatformIO 6.1.19 | Available for existing firmware examples; no firmware change is required here |
| Context7 MCP | Configured through the official `@upstash/context7-mcp` stdio package for current documentation retrieval |
| Serena MCP | Configured through `uvx` for semantic project navigation |
| KiCad CLI 9.0.2 | Installed for future ERC/DRC, plotting, and export automation |
| ngspice 44.2 | Installed and used to run the three starter simulation decks |
| atopile 0.12.5 | Installed as the preferred future manufactured PCB-as-code option |
| tscircuit CLI 0.1.1474 | Installed with the `tsci` compatibility command; used for dated JLC/LCSC MPN, stock, package, basic/extended and price observations |
| Built-in image generation | Used for `mechanical/v1-product-concept.png`; explicitly treated as a non-dimensional appearance reference |

The skill recommends atopile for manufactured PCB-as-code flows. The current
task narrows the floorplan and BOM but still does not justify presenting an
unreviewed generated schematic as buildable. Atopile/tscircuit remain candidates
for the next schematic phase after exact pinouts and footprints are verified.

## Still unavailable

- No Fusion 360, JLCPCB/LCSC, JLC3DP, JLCCNC, RF solver, VNA, or antenna-layout
  automation is available in this environment.
- Fusion 360 has no supported native Linux installation in this environment;
  use neutral STEP/DXF handoff to a supported workstation.
- JLC services remain browser/quote workflows rather than local authoritative
  rule engines. Current Help and order previews still require human review.
- A VNA, RF chamber, and qualified BLE/NFC antenna review are physical/lab
  capabilities and cannot be replaced by installed software.

## Recommended automation

- Pin KiCad and run ERC/DRC plus fabrication export in CI.
- Run ngspice starter decks in batch and archive measurements separately.
- Add dated JLC/LCSC API or reviewed CSV snapshots for stock/lifecycle checks.
- Add BOM/CPL schema and rotation/polarity tests.
- Compare KiCad STEP against a Fusion envelope and produce interference reports.
- Add NFC inductance/tuning worksheets and laboratory measurement templates.
- Restart Codex after skill/MCP installation so the new skills and MCP tools are
  exposed to subsequent sessions.
