# Fusion 360 workflow notes

## Source

Title: Autodesk Fusion Help; URL:
https://help.autodesk.com/view/fusion360/ENU/; publisher: Autodesk; accessed:
2026-06-12. It matters for current STEP/DXF import, linked components, versioning,
interference inspection, drawings, and export behavior.

## Handoff

- Treat KiCad board outline/holes and STEP assembly as electrical masters.
- Use a named origin and units; never align by eye.
- Keep PCB, display, FPC, battery, lens, buttons, light guide, buzzer, and case
  as separate components with versioned parameters.
- Create hard no-go bodies for BLE and NFC antenna regions.
- Run section and interference checks at nominal and tolerance extremes.
- Return enclosure-driven outline/hole changes through an explicit review.

Unresolved: `TODO: VERIFY` exact current Fusion command flow and whether linked
ECAD/MCAD exchange or neutral STEP is more reproducible for contributors.
