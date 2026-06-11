#!/usr/bin/env python3
"""Generate a deterministic V1 schematic planning manifest, not a KiCad design."""

import argparse
import json
from pathlib import Path


BLOCKS = [
    {"id": "power", "items": ["USB-C", "ESD", "LiPo charger/power path", "3V3 regulator"]},
    {"id": "mcu", "items": ["ESP32-S3 module", "EN/BOOT", "USB", "UART/JTAG test pads"]},
    {"id": "display", "items": ["240x320 SPI TFT", "FPC connector", "backlight control"]},
    {"id": "nfc", "items": ["dynamic NFC tag", "I2C", "perimeter loop", "tuning pads"]},
    {"id": "ui", "items": ["three buttons", "side RGB", "piezo", "optional vibration driver"]},
]

REVIEW_GATES = [
    "requirements",
    "research-source-verification",
    "bom",
    "schematic",
    "pcb-layout",
    "mechanical-envelope",
    "simulation",
    "rf-nfc-antenna",
    "japan-radio-certification-note",
    "pre-jlc-order",
]


def build_manifest():
    return {
        "schema": "mcard-v1-schematic-plan-1",
        "notice": "Planning scaffold only. Human electrical review and KiCad ERC/DRC required.",
        "board": {"width_mm": 52.0, "height_mm": 72.0, "thickness_mm": [0.8, 1.0]},
        "finished_thickness_target_mm": 8.5,
        "blocks": BLOCKS,
        "review_gates": REVIEW_GATES,
        "unverified": [
            "exact MPNs and LCSC numbers",
            "symbols, footprints, pin mappings, and dimensions",
            "ESP32-S3 module keepout and strap assignments",
            "NFC loop geometry and tuning",
            "power and charger thermal design",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(build_manifest(), indent=2) + "\n", encoding="utf-8")
    print(f"wrote planning manifest: {args.output}")


if __name__ == "__main__":
    main()
