# AGENTS.md

## Project identity

Repository: `MCard-StarterKit`.

Public clean-room starter kit for Bluetooth animated badge-like devices:
Electronic Badge / NFC Bluetooth Animated GIF Trendy Toy Keychain / MoniCard-style devices.

## Global rules

### Clean-room boundary

Never add:

- vendor cloud endpoints
- official app assets
- captured application code
- firmware blobs
- private identifiers
- tokens
- HAR files
- extracted package artifacts
- `.wxapkg`
- `.bsdiff`
- binary firmware images
- reverse-engineered proprietary source dumps

Allowed:

- public-safe compatibility models
- neutral UUIDs
- synthetic test vectors
- user-owned hardware experiments
- profile-driven command maps
- local emulators
- local parsers
- local package verifiers
- documentation that labels assumptions clearly

### Local-first rule

All normal workflows must work locally.

Do not introduce external service dependencies for normal operation.

### Profile-driven rule

Device-like behavior belongs in profiles, fixtures, JSON rules, or documentation.

Do not hard-code MoniCard-like constants into generic core modules unless they are sample defaults or test fixtures.

### BLE safety rule

BLE writes must be explicit and opt-in.

Do not scan, connect, write, or notify automatically on startup without user action.

Hardware emulator firmware must advertise only sample/public UUIDs by default.

### OTA safety rule

OTA support in this repository is local planning and verification only.

Do not implement firmware flashing against real devices.

The ESP32 / nRF52 emulator may accept OTA-like sample frames and return sample ACKs, but it must not include real vendor firmware update logic.

### Documentation rule

If public behavior changes, update docs.

Update both English and Japanese docs when practical.

### Test rule

Every new feature must include a test or deterministic validation script.

Preferred tests:

- Node.js tests for host-side code
- static checks for Arduino / PlatformIO examples
- sample serial log fixtures
- JSON fixture validation
- protocol vector tests

### Wokwi simulation rule

Use Wokwi CLI and the Wokwi MCP server as an optional integration-test layer
for supported embedded firmware and virtual circuits.

- Run local compile, static checks, protocol tests, and ngspice checks first.
- When Wokwi MCP is available, prefer it for firmware/virtual-hardware
  interaction, serial-log assertions, automation scenarios, and repeatable
  peripheral tests.
- Check the Wokwi Diagram Reference for the exact part first. If unavailable,
  use a documented interface-compatible substitute, or create a small custom
  chip when the required behavior is simple and testable.
- Record every real-part to simulated-part substitution and the behavior that
  is intentionally not modeled.
- Validate `diagram.json` with `wokwi-cli lint --warnings-as-errors`.
- Add a Wokwi logic analyzer and export VCD when digital timing or bus activity
  is part of the acceptance criteria.
- Keep the default `npm test` workflow independent of Wokwi, network access,
  and secrets.
- Do not commit `WOKWI_CLI_TOKEN`, generated firmware binaries, screenshots,
  VCD files, or transient Wokwi output unless a public-safe fixture is
  intentionally required.
- Use only synthetic/public-safe diagrams, inputs, identifiers, and firmware.
- Treat Wokwi results as simulation evidence, not physical electrical, RF,
  thermal, certification, or manufacturing validation.

### Style rule

Keep dependencies light.

Prefer plain Node.js scripts, JSON profiles, PlatformIO or Arduino examples, deterministic fixtures, and small docs.

## Required commands

Run:

```bash
npm test
```

If firmware examples are added, provide one optional build command:

```bash
pio run -d examples/esp32-ble-peripheral
```

or:

```bash
arduino-cli compile --fqbn <fqbn> examples/esp32-ble-peripheral
```

Default `npm test` should not require PlatformIO unless CI already supports it.

If a Wokwi project is present and credentials are available, optional checks
may include:

```bash
wokwi-cli lint --warnings-as-errors
wokwi-cli . --expect-text "<deterministic marker>"
```

## Directory preferences

Preferred layout:

```text
examples/
  esp32-ble-peripheral/
    README.md
    platformio.ini
    src/main.cpp
    include/mcard_profile.h

  nrf52-ble-peripheral/
    README.md
    platformio.ini
    src/main.cpp
    include/mcard_profile.h
```

## Default sample BLE identifiers

Use neutral sample identifiers only.

```text
Service UUID:
7a2f0000-2b3c-4d5e-8f90-000000000000

Write Characteristic UUID:
7a2f0002-2b3c-4d5e-8f90-000000000000

Notify Characteristic UUID:
7a2f0003-2b3c-4d5e-8f90-000000000000
```

If docs currently mention write and notify using the same UUID, fix docs and examples to separate write and notify UUIDs.

## Sample frame model

Outer frame:

```text
uint8  category
uint8  fragmentState
uint16 payloadLengthLE
bytes  payload
```

CONTROL payload:

```text
uint16 commandLE
bytes  data
```

FILE / OTA payload:

```text
uint16 commandLE
uint16 dataLengthLE
bytes  data
```

Sample categories:

```text
OTA     0x01
FILE    0x04
CONTROL 0x1f
```

Fragment states:

```text
0 complete
1 first
2 middle
3 last
```

## Emulator behavior

The hardware emulator should:

- advertise the sample BLE service
- expose a write characteristic
- expose a notify characteristic
- accept frame bytes
- parse only the public sample frame model
- return deterministic virtual notifications
- support basic CONTROL responses
- support FILE data ACK responses
- support OTA planning ACK responses
- print serial RX/TX hex logs
- provide a simple LED/status indication if the board supports it

It should not:

- connect to vendor cloud
- include real firmware images
- implement real vendor OTA flashing
- require secrets
- require proprietary assets
- claim official compatibility
