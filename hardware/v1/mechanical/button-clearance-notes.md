# V1 button clearance notes

Status: rear-button mechanical planning.

## Baseline

- Three buttons sit in a horizontal row on the lower rear face.
- Button row remains below the expanded LiPo keepout.
- Buttons must not require a front chin, wider lower body, or display-over-battery stack.

## Clearance rules

- Reserve switch body, actuator travel, cap, seal/membrane if used, rear wall, tolerance, and tactile clearance.
- Keep caps recessed enough to reduce accidental actuation on clothing or a table.
- Differentiate the center button by cap texture or shape for eyes-free use.
- Keep switch metal and cap hardware outside BLE and NFC keepouts.
- Keep GPIO choices away from unsafe boot-strap behavior.

## Open TODO: VERIFY items

- Exact switch suffix, package height, actuator direction, operating force, travel, lifecycle, footprint, and JLCPCB assembly support.
- Cap geometry, resin wall thickness, sealing/light leakage, button feel, drop loading, and assembly tolerance.
- GPIO mapping, debounce, wake behavior, long-press behavior, ESD path, and boot-strap safety.
