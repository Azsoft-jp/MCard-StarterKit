# Codex skills and tools report

Accessed: 2026-06-12.

## Available and used

| Skill/tool | Use |
|---|---|
| `pcb-as-code` package at `/root/pcb-as-code.skill` | Applied official-source discipline, RF/NFC gates, manufacturing handoff, KiCad review honesty, and `TODO: VERIFY` policy |
| Git and GitHub connector | Repository/branch inspection and authenticated repository access |
| GitHub CLI 2.46.0 | Available for PR creation, but local CLI authentication must be rechecked |
| Python 3 standard library | Dependency-free generator/validator scaffold |
| PlatformIO 6.1.19 | Available for existing firmware examples; no firmware change is required here |

The skill recommends atopile for manufactured PCB-as-code flows. V1 only
requests a roadmap and safe KiCad scaffold, so atopile/tscircuit are documented
as future options rather than adding an unrequested dependency or fake circuit.

## Missing or unavailable

- `ato`, `tsci`, `kicad-cli`, and `ngspice` are not currently on `PATH`.
- Context7 and Serena MCP tools were not exposed by tool discovery.
- No Fusion 360, JLCPCB/LCSC, JLC3DP, JLCCNC, RF solver, VNA, or antenna-layout
  automation is available in this environment.

## Recommended automation

- Pin KiCad and run ERC/DRC plus fabrication export in CI.
- Run ngspice starter decks in batch and archive measurements separately.
- Add dated JLC/LCSC API or reviewed CSV snapshots for stock/lifecycle checks.
- Add BOM/CPL schema and rotation/polarity tests.
- Compare KiCad STEP against a Fusion envelope and produce interference reports.
- Add NFC inductance/tuning worksheets and laboratory measurement templates.
- Install the skill unpacked under `~/.codex/skills/pcb-as-code/` for automatic
  future discovery, retaining its references.
