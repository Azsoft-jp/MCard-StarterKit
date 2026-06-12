#!/usr/bin/env python3
"""Deterministically validate the V1 planning workspace."""

import csv
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True

from generate_v1_schematic import planned_outputs


ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "hardware" / "v1"
KICAD = V1 / "kicad"
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
    "research/BOM_SOURCE_NOTES.md", "reviews/BOM_REVIEW_CHECKLIST.md",
    "jlcpcb/pcba/lcsc-bom-shortlist.csv", "simulation/README.md",
    "jlcpcb/pcba/pcba-selection-rules.md",
    "jlcpcb/pcba/lcsc-bom-selected.csv",
    "mechanical/v1-envelope.json", "mechanical/v1-floorplan.svg",
    "mechanical/v1-stackup.svg", "mechanical/v1-product-concept.png",
    "mechanical/v1-product-concept-v2.png",
    "mechanical/v1-product-concept-v3.png",
    "mechanical/v1-product-concept-v4.png",
    "simulation/power_3v3_load_step.cir", "simulation/rgb_led_current_limit.cir",
    "simulation/vibration_motor_driver.cir",
    "kicad/MCard_V1.kicad_pro", "kicad/MCard_V1.kicad_sch",
    "kicad/README.md", "kicad/SCHEMATIC_REVIEW_CHECKLIST.md",
    "reviews/KICAD_SCAFFOLD_REVIEW.md",
]
REQUIRED_ROOT_FILES = [
    "tools/kicad-gen/README.md",
    "tools/kicad-gen/generate_v1_schematic.py",
    "tools/kicad-gen/validate_v1_design.py",
]
GATES = [
    "Requirements", "Research/source verification", "BOM", "Schematic",
    "PCB layout", "Mechanical envelope", "Simulation", "RF/NFC antenna review",
    "Japan radio certification note", "Pre-JLC order",
]
KICAD_SECTIONS = [
    "Power input and LiPo charger",
    "3.3 V power rail",
    "ESP32-S3 module",
    "USB-C / USB data / ESD",
    "240x320 TFT display connector",
    "Dynamic NFC tag and I2C",
    "Optional SPI NOR flash",
    "RGB LEDs",
    "Buttons",
    "Piezo buzzer",
    "Optional vibration motor driver",
    "Test pads",
]
HUMAN_REVIEW_PHRASES = [
    "starter scaffold",
    "human electrical review",
    "not electrically verified",
]
TODO_PHRASES = [
    "TODO: VERIFY exact footprint",
    "TODO: VERIFY datasheet-confirmed pinout",
    "TODO: VERIFY JLCPCB assembly status",
]
FORBIDDEN_ASSET_SUFFIXES = {".wxapkg", ".bsdiff", ".har", ".bin"}
FORBIDDEN_GENERATED_TERMS = [
    "monicard",
    "vendor cloud endpoint",
    "firmware blob",
    "private identifier",
    "proprietary source dump",
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


def balanced_s_expression(text):
    depth = 0
    in_string = False
    escaped = False
    for character in text:
        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue
        if character == '"':
            in_string = True
        elif character == "(":
            depth += 1
        elif character == ")":
            depth -= 1
            if depth < 0:
                return False
    return depth == 0 and not in_string


def main():
    errors = 0
    for rel in REQUIRED:
        path = V1 / rel
        if not path.is_file() or path.stat().st_size == 0:
            errors += fail(f"missing or empty {path.relative_to(ROOT)}")
    for rel in REQUIRED_ROOT_FILES:
        path = ROOT / rel
        if not path.is_file() or path.stat().st_size == 0:
            errors += fail(f"missing or empty {path.relative_to(ROOT)}")

    combined = "\n".join(
        path.read_text(encoding="utf-8")
        for path in V1.rglob("*")
        if path.is_file() and path.suffix in {".md", ".csv", ".cir"}
    )
    for text in ["46 x 84", "49 x 99", "8.5 mm", "0.8 mm", "TODO: VERIFY", "human electrical review"]:
        if text.lower() not in combined.lower():
            errors += fail(f"required planning phrase absent: {text}")

    project_path = KICAD / "MCard_V1.kicad_pro"
    schematic_path = KICAD / "MCard_V1.kicad_sch"
    if project_path.is_file() and schematic_path.is_file():
        try:
            project = json.loads(project_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            errors += fail(f"KiCad project JSON is invalid: {error}")
            project = {}
        schematic = schematic_path.read_text(encoding="utf-8")
        generated_text = json.dumps(project) + "\n" + schematic

        if not schematic.lstrip().startswith("(kicad_sch"):
            errors += fail("generated schematic lacks kicad_sch header")
        if not balanced_s_expression(schematic):
            errors += fail("generated schematic S-expression is unbalanced")
        if "(generator \"mcard_v1_scaffold_generator\")" not in schematic:
            errors += fail("generated schematic lacks unique generator identity")
        if "(lib_symbols)" not in schematic:
            errors += fail("generated scaffold must remain note-only until parts are verified")

        for section in KICAD_SECTIONS:
            if f"SECTION: {section}".lower() not in schematic.lower():
                errors += fail(f"KiCad scaffold section absent: {section}")
        for phrase in TODO_PHRASES:
            if phrase.lower() not in generated_text.lower():
                errors += fail(f"KiCad scaffold verification marker absent: {phrase}")
        for generated_path, content in [
            (project_path, json.dumps(project)),
            (schematic_path, schematic),
        ]:
            for phrase in HUMAN_REVIEW_PHRASES:
                if phrase.lower() not in content.lower():
                    errors += fail(
                        f"KiCad scaffold review warning absent from "
                        f"{generated_path.name}: {phrase}"
                    )
        if schematic.count("TODO: VERIFY") < len(KICAD_SECTIONS) * 3:
            errors += fail("each KiCad section must retain footprint, pinout, and assembly TODOs")
        for term in FORBIDDEN_GENERATED_TERMS:
            if term in generated_text.lower():
                errors += fail(f"forbidden term present in generated KiCad files: {term}")

        for path, expected in planned_outputs(KICAD).items():
            if not path.is_file() or path.read_text(encoding="utf-8") != expected:
                errors += fail(
                    f"generated KiCad file is stale; rerun generator: "
                    f"{path.relative_to(ROOT)}"
                )

    scoped_asset_roots = [
        KICAD,
        ROOT / "tools" / "kicad-gen",
        V1 / "reviews",
    ]
    for asset_root in scoped_asset_roots:
        if not asset_root.exists():
            continue
        for path in asset_root.rglob("*"):
            if path.is_file() and path.suffix.lower() in FORBIDDEN_ASSET_SUFFIXES:
                errors += fail(f"forbidden asset type present: {path.relative_to(ROOT)}")

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
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames
        rows = list(reader)
    required_columns = [
        "Block", "DesignatorHint", "PreferredPart", "AlternativePart", "Package",
        "Value", "VoltageCurrentRating", "JLCPCBStatus", "LCSCStatus", "Reason",
        "Risk", "FootprintTodo", "DatasheetUrl", "Notes",
    ]
    if not rows or fieldnames != required_columns:
        errors += fail("BOM shortlist columns are incomplete")

    required_blocks = {
        "MCU / BLE module", "Display panel", "Display connector",
        "Dynamic NFC tag", "NFC antenna / matching", "External SPI NOR",
        "USB-C connector", "USB CC resistors", "USB ESD",
        "LiPo charger / power path",
        "Battery connector", "3.3 V regulator", "Backlight control",
        "RGB side LEDs", "Tactile switches", "Piezo buzzer",
        "Optional vibration motor", "Vibration motor NMOS", "I2C pullups",
        "SPI series resistors", "Test pads", "Mounting / mechanical",
    }
    present_blocks = {row["Block"] for row in rows}
    missing_blocks = sorted(required_blocks - present_blocks)
    if missing_blocks:
        errors += fail(f"BOM shortlist blocks are incomplete: {', '.join(missing_blocks)}")

    envelope = json.loads(
        (V1 / "mechanical" / "v1-envelope.json").read_text(encoding="utf-8")
    )
    board = envelope["board"]
    if board["width"] != 46.0 or board["height"] != 84.0:
        errors += fail("mechanical envelope board must remain 46 x 84 mm")
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
    if envelope["case"]["thickness_step_side"] != "rear only":
        errors += fail("thickness transition must remain on the rear face only")
    if envelope["case"]["front_surface_profile"] != "single continuous flat datum":
        errors += fail("front enclosure surface must remain flat")
    if (
        envelope["case"]["body_external_width_upper"]
        != envelope["case"]["body_external_width_lower"]
        or envelope["case"]["body_external_width_upper"]
        != envelope["case"]["body_external_width"]
    ):
        errors += fail("upper and lower enclosure widths must remain identical")
    if envelope["case"]["nominal_external_width"] != 49.0:
        errors += fail("nominal product width must remain 49 mm")
    if envelope["case"]["nominal_external_height_including_strap"] != 99.0:
        errors += fail("nominal product height including strap must remain 99 mm")
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

    buttons = [
        placements["button_left"],
        placements["button_center"],
        placements["button_right"],
    ]
    if any(button["side"] != "rear" for button in buttons):
        errors += fail("all three buttons must remain on the rear")
    if len({button["y"] for button in buttons}) != 1:
        errors += fail("rear buttons must remain in one horizontal row")
    if not (
        placements["rgb_left"]["side"] == "front"
        and placements["rgb_right"]["side"] == "front"
    ):
        errors += fail("both RGB guides must remain front-visible")

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
