# CodexCLI initial prompt

You are working on the public repository `MCard-StarterKit`.

Read `AGENTS.md` and `CODEX_MEMORY.md` first.

Implement the task in `tasks/ESP32_NRF52_BLE_EMULATOR_IMPLEMENTATION.md`.

Important constraints:

- Keep the repository public-safe and clean-room.
- Do not add vendor cloud endpoints, captured app code, official assets, firmware blobs, HAR files, `.wxapkg`, `.bsdiff`, private identifiers, or extracted package artifacts.
- Add ESP32 and nRF52 BLE peripheral emulator examples for local Web Bluetooth testing.
- Use neutral sample UUIDs:
  - service `7a2f0000-2b3c-4d5e-8f90-000000000000`
  - write `7a2f0002-2b3c-4d5e-8f90-000000000000`
  - notify `7a2f0003-2b3c-4d5e-8f90-000000000000`
- The emulator should advertise, accept write frames, emit deterministic notify responses, and log RX/TX hex to serial.
- Implement ESP32 first.
- Add nRF52 implementation or compile-friendly skeleton with clear TODOs.
- Update English and Japanese docs.
- Add static validation tests.
- Update `package.json` test script.
- Run `npm test`.

When finished, summarize:

1. files added
2. behavior implemented
3. tests added
4. docs updated
5. commands run
6. any limitations
