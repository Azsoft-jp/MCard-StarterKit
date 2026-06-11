#!/usr/bin/env python3
"""Deterministically validate the V1 planning workspace."""

import csv
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "hardware" / "v1"
REQUIRED = [
    "README.md", "ROADMAP.md", "REQUIREMENTS.md", "ARCHITECTURE.md",
    "BOM_CANDIDATES.md", "PCB_CONSTRAINTS.md", "MECHANICAL_CONSTRAINTS.md",
    "SIMULATION_PLAN.md", "JLCPCB_PCBA_NOTES.md", "RISK_REGISTER.md",
    "research/OFFICIAL_DOCS_INDEX.md", "research/JLCPCB_PCBA_RULES.md",
    "research/LCSC_BOM_RULES.md", "research/JLC3DP_RULES.md",
    "research/JLCCNC_RULES.md", "research/KICAD_WORKFLOW_NOTES.md",
    "research/FUSION360_WORKFLOW_NOTES.md", "research/ESP32S3_HARDWARE_NOTES.md",
    "research/NFC_DYNAMIC_TAG_NOTES.md", "research/RF_ANTENNA_LAYOUT_NOTES.md",
    "research/COMMUNITY_TIPS_INDEX.md", "research/CODEX_SKILLS_AND_TOOLS.md",
    "jlcpcb/pcba/lcsc-bom-shortlist.csv", "simulation/README.md",
    "simulation/power_3v3_load_step.cir", "simulation/rgb_led_current_limit.cir",
    "simulation/vibration_motor_driver.cir",
]
GATES = [
    "Requirements", "Research/source verification", "BOM", "Schematic",
    "PCB layout", "Mechanical envelope", "Simulation", "RF/NFC antenna review",
    "Japan radio certification note", "Pre-JLC order",
]


def fail(message):
    print(f"FAIL: {message}", file=sys.stderr)
    return 1


def main():
    errors = 0
    for rel in REQUIRED:
        path = V1 / rel
        if not path.is_file() or path.stat().st_size == 0:
            errors += fail(f"missing or empty {path.relative_to(ROOT)}")

    combined = "\n".join(
        path.read_text(encoding="utf-8")
        for path in V1.rglob("*")
        if path.is_file() and path.suffix in {".md", ".csv", ".cir"}
    )
    for text in ["52 x 72", "8.5 mm", "0.8 mm", "TODO: VERIFY", "human electrical review"]:
        if text.lower() not in combined.lower():
            errors += fail(f"required planning phrase absent: {text}")

    roadmap = (V1 / "ROADMAP.md").read_text(encoding="utf-8")
    for gate in GATES:
        if gate.lower() not in roadmap.lower():
            errors += fail(f"roadmap gate absent: {gate}")

    index = (V1 / "research" / "OFFICIAL_DOCS_INDEX.md").read_text(encoding="utf-8")
    if "2026-06-12" not in index or len(re.findall(r"https://", index)) < 10:
        errors += fail("official source index lacks access date or source coverage")

    with (V1 / "jlcpcb" / "pcba" / "lcsc-bom-shortlist.csv").open(
        newline="", encoding="utf-8"
    ) as handle:
        rows = list(csv.DictReader(handle))
    required_columns = {
        "Block", "Part Family", "Candidate Part", "Package", "Why Considered",
        "JLC-LCSC Verification", "Risk", "Fallback", "Official Datasheet", "TODO",
    }
    if not rows or set(rows[0]) != required_columns:
        errors += fail("BOM shortlist columns are incomplete")

    for circuit in (V1 / "simulation").glob("*.cir"):
        body = circuit.read_text(encoding="utf-8").lower()
        if ".end" not in body or (".tran" not in body and ".dc" not in body):
            errors += fail(f"SPICE analysis/end missing in {circuit.name}")

    forbidden = [".wxapkg", ".bsdiff", "captured application code", "firmware blob"]
    for term in forbidden:
        if term in combined.lower():
            errors += fail(f"forbidden or unsafe phrase present: {term}")

    if errors:
        return 1
    print(f"V1 hardware workspace validation passed ({len(REQUIRED)} required files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
