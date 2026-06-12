#!/usr/bin/env python3
"""Deterministically validate the V1 planning workspace."""

import csv
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "hardware" / "v1"
REQUIRED = [
    "README.md", "ROADMAP.md", "REQUIREMENTS.md", "ARCHITECTURE.md",
    "BOM_CANDIDATES.md", "PCB_CONSTRAINTS.md", "MECHANICAL_CONSTRAINTS.md",
    "SIMULATION_PLAN.md", "JLCPCB_PCBA_NOTES.md", "RISK_REGISTER.md",
    "PRODUCT_DESIGN.md", "BOM_SELECTED_V1.md",
    "research/OFFICIAL_DOCS_INDEX.md", "research/JLCPCB_PCBA_RULES.md",
    "research/LCSC_BOM_RULES.md", "research/JLC3DP_RULES.md",
    "research/JLCCNC_RULES.md", "research/KICAD_WORKFLOW_NOTES.md",
    "research/FUSION360_WORKFLOW_NOTES.md", "research/ESP32S3_HARDWARE_NOTES.md",
    "research/NFC_DYNAMIC_TAG_NOTES.md", "research/RF_ANTENNA_LAYOUT_NOTES.md",
    "research/COMMUNITY_TIPS_INDEX.md", "research/CODEX_SKILLS_AND_TOOLS.md",
    "jlcpcb/pcba/lcsc-bom-shortlist.csv", "simulation/README.md",
    "jlcpcb/pcba/lcsc-bom-selected.csv",
    "mechanical/v1-envelope.json", "mechanical/v1-floorplan.svg",
    "mechanical/v1-stackup.svg", "mechanical/v1-product-concept.png",
    "mechanical/v1-product-concept-v2.png",
    "mechanical/v1-product-concept-v3.png",
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


def rectangles_overlap(a, b):
    return not (
        a["x"] + a["width"] <= b["x"]
        or b["x"] + b["width"] <= a["x"]
        or a["y"] + a["height"] <= b["y"]
        or b["y"] + b["height"] <= a["y"]
    )


def axis_gap(a, b):
    gap_x = max(a["x"], b["x"]) - min(
        a["x"] + a["width"], b["x"] + b["width"]
    )
    gap_y = max(a["y"], b["y"]) - min(
        a["y"] + a["height"], b["y"] + b["height"]
    )
    return max(gap_x, gap_y)


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

    envelope = json.loads(
        (V1 / "mechanical" / "v1-envelope.json").read_text(encoding="utf-8")
    )
    board = envelope["board"]
    if board["width"] != 52.0 or board["height"] != 72.0:
        errors += fail("mechanical envelope board must remain 52 x 72 mm")
    if board["thickness"] != 0.8:
        errors += fail("mechanical envelope preferred board thickness must be 0.8 mm")
    if envelope["case"]["target_external_thickness"] != 8.5:
        errors += fail("case target thickness must remain 8.5 mm")
    placements = {item["id"]: item for item in envelope["placements"]}
    display_region = envelope["case"]["display_region_external_thickness"]
    battery_region = envelope["case"]["battery_region_external_thickness"]
    if display_region >= battery_region:
        errors += fail("LCD region must be thinner than LiPo region")
    if battery_region != envelope["case"]["target_external_thickness"]:
        errors += fail("LiPo region must define the 8.5 mm maximum thickness")
    if envelope["case"]["thickness_step_side"] != "front only":
        errors += fail("thickness transition must remain on the front face only")
    if envelope["case"]["rear_surface_profile"] != "single continuous flat datum":
        errors += fail("rear enclosure surface must remain flat")
    if (
        envelope["case"]["body_external_width_upper"]
        != envelope["case"]["body_external_width_lower"]
        or envelope["case"]["body_external_width_upper"]
        != envelope["case"]["body_external_width"]
    ):
        errors += fail("upper and lower enclosure widths must remain identical")
    if envelope["case"]["step_transition_y"] > placements.get(
        "display_panel", {"y": 0}
    )["y"]:
        errors += fail("case thickness transition intrudes into display region")

    for item in placements.values():
        if (
            item["x"] < 0
            or item["y"] < 0
            or item["x"] + item["width"] > board["width"]
            or item["y"] + item["height"] > board["height"]
        ):
            errors += fail(f"placement outside board envelope: {item['id']}")

    for a_id, b_id in envelope["required_non_overlap"]:
        if rectangles_overlap(placements[a_id], placements[b_id]):
            errors += fail(f"required keepouts overlap: {a_id} / {b_id}")

    for rule in envelope["minimum_xy_gaps"]:
        actual = axis_gap(placements[rule["a"]], placements[rule["b"]])
        if actual + 1e-9 < rule["gap"]:
            errors += fail(
                f"gap {rule['a']} / {rule['b']} is {actual:.2f} mm, "
                f"requires {rule['gap']:.2f} mm"
            )

    features = {item["id"]: item for item in envelope["enclosure_features"]}
    bridge = features["strap_bridge"]
    opening = features["strap_opening"]
    if bridge["y"] < board["height"]:
        errors += fail("strap bridge must remain outside the PCB outline")
    if not (
        bridge["x"] <= opening["x"]
        and bridge["y"] <= opening["y"]
        and opening["x"] + opening["width"] <= bridge["x"] + bridge["width"]
        and opening["y"] + opening["height"] <= bridge["y"] + bridge["height"]
    ):
        errors += fail("strap opening must remain inside strap bridge")
    if rectangles_overlap(bridge, placements["ble_antenna_keepout"]):
        errors += fail("strap bridge overlaps BLE antenna keepout")
    if "non-metal" not in opening["hardware"]:
        errors += fail("V1 strap hardware must remain non-metal")

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
