# Mechanical and placement review

## Status

- Stage: current PR-3 correction
- Baseline: 49 x 99 mm product / 46 x 84 mm PCB / upper display and lower LiPo
- Result: CONDITIONAL / HUMAN MECHANICAL AND RF REVIEW REQUIRED

## Accepted planning constraints

- 0.8 mm PCB target; 1.0 mm fallback.
- Flat front, 6.8 mm upper region, rear-only transition to 8.5 mm lower region.
- Display and expanded battery keepout remain separated in XY.
- BLE module remains at the upper-right board edge with exact keepout pending.
- NFC loop remains at the perimeter and detours around BLE/USB/mechanical
  exclusions.
- USB-C, three lower-rear buttons, bilateral RGB guides, piezo, optional motor,
  and fixture-facing test pads have explicit placement dependencies.
- Finished product uses no pin headers and no V1 aluminum back cover.

## Open gates

- `TODO: VERIFY` display/window/FPC drawing and sample.
- `TODO: VERIFY` exact protected LiPo, swelling, insulation, adhesive, wires,
  polarity, and runtime.
- `TODO: VERIFY` BLE module keepout and assembled NFC tuning.
- `TODO: VERIFY` USB-C opening, plug/cable volume, buttons, light guides, piezo
  cavity, and optional motor volume in Fusion 360.
- `TODO: VERIFY` JLC3DP resin walls, tolerances, snaps/bosses, cleanup, optical
  behavior, and strength.
- Complete STEP interference review before PCB layout release.
