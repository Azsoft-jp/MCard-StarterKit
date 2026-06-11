# CODEX_MEMORY.md

## Project memory for CodexCLI

Project: `MCard-StarterKit`.

Public clean-room starter kit for Bluetooth animated badge-like devices.

Current repository goals:

- Keep the repository public-safe.
- Keep behavior local-first.
- Keep device-specific values profile-driven.
- Keep BLE operations opt-in.
- Provide developer-friendly English and Japanese docs.
- Support local dashboard workflows:
  - media import
  - package building
  - frame building
  - notify parsing
  - ACK/retry logic
  - emulator notify
  - Web Bluetooth transport
- Add real-hardware BLE peripheral emulator examples for ESP32 and nRF52.

## Clean-room forbidden content

Do not add:

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

## Current sample protocol model

Outer frame:

```text
uint8 category
uint8 fragmentState
uint16 payloadLengthLE
bytes payload
```

CONTROL payload:

```text
uint16 commandLE
bytes data
```

FILE / OTA payload:

```text
uint16 commandLE
uint16 dataLengthLE
bytes data
```

Sample categories:

```text
OTA     0x01
FILE    0x04
CONTROL 0x1f
```

Sample UUIDs:

```text
service: 7a2f0000-2b3c-4d5e-8f90-000000000000
write:   7a2f0002-2b3c-4d5e-8f90-000000000000
notify:  7a2f0003-2b3c-4d5e-8f90-000000000000
```

## Hardware emulator target

Implement hardware BLE peripheral examples:

1. ESP32 peripheral emulator
2. nRF52 peripheral emulator

The emulator should behave like a sample MoniCard-like device, but must be described as a public-safe compatibility emulator, not as official vendor firmware.

## Preferred response behavior

CONTROL version query example:

Request:

```text
1f 00 02 00 14 00
```

Response:

```text
1f 00 07 00 15 00 30 2e 31 2e 30
```

Meaning:

```json
{
  "group": "control",
  "commandName": "VERSION_RESPONSE",
  "value": "0.1.0"
}
```

FILE data ACK example:

```text
04 00 0a 00 09 00 06 00 00 00 01 00 00 00
```

OTA data ACK example:

```text
01 00 0a 00 29 00 06 00 00 00 01 00 00 00
```

Use sample command constants from the public profile if available.

## Test expectations

Run:

```bash
npm test
```

Add static validation for firmware examples.

The static test should check:

- required files exist
- sample UUIDs appear
- advertised name appears
- no forbidden binary files
- docs mention hardware emulator
- README mentions ESP32 or nRF52
- no `BUILD_REPORT.txt`

Do not require PlatformIO in default `npm test` unless the environment already supports it.
