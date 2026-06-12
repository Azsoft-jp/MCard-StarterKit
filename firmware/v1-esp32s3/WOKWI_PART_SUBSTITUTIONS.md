# Wokwi V1 simulation substitutions

The Wokwi project is an optional public-safe firmware integration harness. It
does not represent the V1 PCB layout, RF behavior, power integrity, charging,
thermal behavior, or certification.

| Planned V1 item | Wokwi item | Modeled behavior | Intentionally not modeled |
|---|---|---|---|
| ESP32-S3 module, `TODO: VERIFY` exact variant | `board-esp32-s3-devkitc-1` | Arduino startup, serial output, firmware execution, and one simulation-only GPIO | Module footprint, flash/PSRAM variant, USB implementation, antenna, current draw, and Japan radio certification |
| Product status indication, `TODO: VERIFY` | Green `wokwi-led` plus 1 kOhm resistor on simulation-only GPIO4 | Deterministic 1 Hz heartbeat | Product LED choice, brightness, current budget, placement, and final pin mapping |
| Digital timing capture | `wokwi-logic-analyzer` channel D0 | Heartbeat edge capture and VCD export | Analog edge shape, loading, EMI, and physical probe effects |

BLE radio initialization is skipped only in the Wokwi build. The normal
firmware build retains the safe peripheral skeleton, and the public frame model
is tested on the host. The virtual run is not BLE advertising, connection,
notification, RF, or interoperability evidence.

The TFT, dynamic NFC tag, RGB side light, buttons, piezo, vibration motor,
battery, charger, and 3V3 regulator are omitted because their exact parts,
pinout, or product GPIO assignments remain `TODO: VERIFY`. Host protocol tests
and ngspice decks cover the behavior that can currently be checked without
inventing a misleading virtual circuit.

If a required exact Wokwi part is unavailable later, first document an
interface-compatible substitute here. Use a small custom C/WASM chip only when
the missing behavior is simple, deterministic, and covered by a test.
