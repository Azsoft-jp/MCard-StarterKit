#!/usr/bin/env python3
"""Generate the review-only MCard V1 KiCad schematic scaffold."""

import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = ROOT / "hardware" / "v1" / "kicad"
PROJECT_NAME = "MCard_V1"
PROJECT_FILENAME = f"{PROJECT_NAME}.kicad_pro"
SCHEMATIC_FILENAME = f"{PROJECT_NAME}.kicad_sch"
WARNING = (
    "GENERATED STARTER SCAFFOLD ONLY - HUMAN ELECTRICAL REVIEW REQUIRED; "
    "NOT ELECTRICALLY VERIFIED OR APPROVED FOR FABRICATION"
)

SECTIONS = [
    {
        "title": "Power input and LiPo charger",
        "candidate": "USB-C 5 V input, protected LiPo, BQ24074-class power path",
        "scope": "Input limits, charge current, NTC strategy, status, and thermal path",
    },
    {
        "title": "3.3 V power rail",
        "candidate": "TPS63031-class buck-boost with inductor and decoupling",
        "scope": "Peak load, stability, efficiency, brownout, and power sequencing",
    },
    {
        "title": "ESP32-S3 module",
        "candidate": "ESP32-S3-MINI-1-N4R2 direction from V1 BOM shortlist",
        "scope": "Power, EN/BOOT, straps, GPIO allocation, USB, and decoupling",
    },
    {
        "title": "USB-C / USB data / ESD",
        "candidate": "USB4105-class receptacle and low-capacitance USB ESD",
        "scope": "CC pull-downs, D+/D-, shield, return path, and connector mechanics",
    },
    {
        "title": "240x320 TFT display connector",
        "candidate": "14-pin 0.5 mm FPC connector for ST7789-class SPI panel",
        "scope": "FPC contact side, SPI, reset/DC/CS, backlight, and insertion direction",
    },
    {
        "title": "Dynamic NFC tag and I2C",
        "candidate": "ST25DV04KC-class dynamic tag, I2C pull-ups, and tuning placeholders",
        "scope": "I2C address, GPO/FD, energy harvesting decision, loop, and measurement pads",
    },
    {
        "title": "Optional SPI NOR flash",
        "candidate": "W25Q128JV-class 3.3 V SPI NOR; DNP until architecture review",
        "scope": "Bus sharing, chip select, hold/write protect, decoupling, and DNP safety",
    },
    {
        "title": "RGB LEDs",
        "candidate": "SK6805-EC15-class side emitters with current budget controls",
        "scope": "Supply, 3.3 V data margin, direction, decoupling, and optical orientation",
    },
    {
        "title": "Buttons",
        "candidate": "Three SKRPACE010-class tactile switches",
        "scope": "GPIO straps, pull-ups, debounce, wake behavior, and actuator direction",
    },
    {
        "title": "Piezo buzzer",
        "candidate": "PKLCS1212E4001-R1-class passive piezo",
        "scope": "Drive topology, voltage, resonant frequency, acoustic port, and quiet state",
    },
    {
        "title": "Optional vibration motor driver",
        "candidate": "DNP motor pads and AO3400A-class low-side switch",
        "scope": "Stall current, 3.3 V gate drive, flyback, EMI, timeout, and DNP safety",
    },
    {
        "title": "Test pads",
        "candidate": "Bare ENIG pogo pads; no unverified SMT test-point footprints",
        "scope": "GND, VBUS, VBAT, 3V3, EN, BOOT, UART, USB, I2C, SPI, and switched loads",
    },
]


def stable_uuid(label):
    return str(uuid5(NAMESPACE_URL, f"mcard-v1-kicad-scaffold:{label}"))


def escape_kicad_text(value):
    return value.replace("\\", "\\\\").replace('"', '\\"')


def schematic_text(value, x, y, size, label):
    return f"""\
  (text "{escape_kicad_text(value)}"
    (exclude_from_sim no)
    (at {x:.2f} {y:.2f} 0)
    (effects
      (font (size {size:.2f} {size:.2f}))
      (justify left bottom)
    )
    (uuid "{stable_uuid(label)}")
  )"""


def build_schematic():
    entries = [
        schematic_text(WARNING, 20, 18, 1.5, "warning"),
        schematic_text(
            "Generated notes only: no symbols, nets, footprints, or pin mappings are approved.",
            20,
            23,
            1.1,
            "scope-warning",
        ),
        schematic_text(
            "BLE antenna: TODO: VERIFY exact ESP32-S3 module edge placement and datasheet keepout.",
            20,
            28,
            1.1,
            "ble-keepout",
        ),
        schematic_text(
            "NFC antenna: TODO: VERIFY loop geometry, metal exclusions, tuning network, and assembled measurement.",
            20,
            33,
            1.1,
            "nfc-keepout",
        ),
    ]

    for index, section in enumerate(SECTIONS):
        column = index // 6
        row = index % 6
        x = 20 + (column * 195)
        y = 47 + (row * 39)
        slug = section["title"].lower().replace(" ", "-").replace("/", "-")
        entries.extend(
            [
                schematic_text(f"SECTION: {section['title']}", x, y, 1.5, f"{slug}-title"),
                schematic_text(f"Candidate direction: {section['candidate']}", x, y + 5, 1.0, f"{slug}-candidate"),
                schematic_text(f"Review scope: {section['scope']}", x, y + 10, 1.0, f"{slug}-scope"),
                schematic_text(
                    "TODO: VERIFY exact footprint and land pattern before symbol placement.",
                    x,
                    y + 15,
                    1.0,
                    f"{slug}-footprint",
                ),
                schematic_text(
                    "TODO: VERIFY datasheet-confirmed pinout and electrical limits.",
                    x,
                    y + 20,
                    1.0,
                    f"{slug}-pinout",
                ),
                schematic_text(
                    "TODO: VERIFY JLCPCB assembly status, orientation, and DNP/manual-install state.",
                    x,
                    y + 25,
                    1.0,
                    f"{slug}-assembly",
                ),
            ]
        )

    body = "\n".join(entries)
    return f"""\
(kicad_sch
  (version 20250114)
  (generator "mcard_v1_scaffold_generator")
  (generator_version "1.0")
  (uuid "{stable_uuid('root')}")
  (paper "A3")
  (title_block
    (title "MCard V1 generated schematic scaffold")
    (company "MCard-StarterKit clean-room hardware study")
    (comment 1 "Starter/scaffold requiring human electrical review")
    (comment 2 "No electrical verification or fabrication approval")
  )
  (lib_symbols)
{body}
  (sheet_instances
    (path "/" (page "1"))
  )
  (embedded_fonts no)
)
"""


def build_project():
    return {
        "board": {
            "design_settings": {
                "defaults": {},
                "diff_pair_dimensions": [],
                "drc_exclusions": [],
                "rules": {},
                "track_widths": [],
                "via_dimensions": [],
            }
        },
        "boards": [],
        "libraries": {
            "pinned_footprint_libs": [],
            "pinned_symbol_libs": [],
        },
        "meta": {
            "filename": PROJECT_FILENAME,
            "version": 1,
        },
        "net_settings": {
            "classes": [],
            "meta": {"version": 0},
        },
        "pcbnew": {"page_layout_descr_file": ""},
        "sheets": [],
        "text_variables": {
            "SCAFFOLD_STATUS": WARNING,
            "FOOTPRINT_STATUS": "TODO: VERIFY exact footprints",
            "PINOUT_STATUS": "TODO: VERIFY datasheet-confirmed pinout",
            "ASSEMBLY_STATUS": "TODO: VERIFY JLCPCB assembly status",
        },
    }


def build_manifest():
    return {
        "schema": "mcard-v1-kicad-scaffold-1",
        "notice": WARNING,
        "generated_files": [PROJECT_FILENAME, SCHEMATIC_FILENAME],
        "sections": [section["title"] for section in SECTIONS],
        "constraints": {
            "ble_antenna_keepout": "TODO: VERIFY from exact module datasheet",
            "nfc_loop_keepout_and_tuning": "TODO: VERIFY on assembled hardware",
        },
    }


def planned_outputs(output_dir, manifest_path=None):
    outputs = {
        output_dir / PROJECT_FILENAME: json.dumps(build_project(), indent=2) + "\n",
        output_dir / SCHEMATIC_FILENAME: build_schematic(),
    }
    if manifest_path is not None:
        outputs[manifest_path] = json.dumps(build_manifest(), indent=2) + "\n"
    return outputs


def changed_outputs(outputs):
    changed = []
    for path, content in outputs.items():
        if not path.is_file() or path.read_text(encoding="utf-8") != content:
            changed.append(path)
    return changed


def write_outputs(outputs, force):
    conflicts = [
        path
        for path, content in outputs.items()
        if path.exists() and path.read_text(encoding="utf-8") != content
    ]
    if conflicts and not force:
        names = ", ".join(str(path) for path in conflicts)
        raise RuntimeError(
            f"refusing to overwrite changed files: {names}; "
            "review them, then rerun with --force to create timestamped backups"
        )

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    for path in conflicts:
        backup = path.with_name(f"{path.name}.bak-{timestamp}")
        shutil.copy2(path, backup)
        print(f"backed up: {backup}")

    for path, content in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.is_file() and path.read_text(encoding="utf-8") == content:
            print(f"unchanged: {path}")
            continue
        path.write_text(content, encoding="utf-8")
        print(f"wrote: {path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument(
        "--force",
        action="store_true",
        help="back up changed existing files before overwriting them",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="exit nonzero if generated files are missing or stale; write nothing",
    )
    args = parser.parse_args()

    outputs = planned_outputs(args.output_dir.resolve(), args.manifest)
    if args.check:
        changed = changed_outputs(outputs)
        if changed:
            for path in changed:
                print(f"stale or missing: {path}")
            return 1
        print("KiCad scaffold files match deterministic generator output")
        return 0

    try:
        write_outputs(outputs, args.force)
    except RuntimeError as error:
        parser.error(str(error))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
