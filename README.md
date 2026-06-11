<p align="center">
  <img src="https://img.shields.io/badge/MCard--StarterKit-local--first-7a2fcd?style=for-the-badge" alt="MCard-StarterKit">
</p>

<h1 align="center">MCard-StarterKit</h1>

<h2 align="center">
  A clean-room playground for Bluetooth animated badge experiments.
</h2>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="./package.json">
    <img src="https://img.shields.io/badge/runtime-Node.js-339933.svg" alt="Node.js">
  </a>
  <a href="./docs/README.md">
    <img src="https://img.shields.io/badge/docs-English-555.svg" alt="English docs">
  </a>
  <a href="./docs-ja/README.md">
    <img src="https://img.shields.io/badge/docs-日本語-ff69b4.svg" alt="Japanese docs">
  </a>
  <img src="https://img.shields.io/badge/BLE-opt--in-orange.svg" alt="BLE opt-in">
  <img src="https://img.shields.io/badge/cloud-none-lightgrey.svg" alt="No cloud">
</p>

<p align="center">
  <strong>Profile-driven media packaging, frame building, BLE transport experiments, parsers, retry logic, and local emulation for animated badge-like devices.</strong>
</p>

---

## What can it do?

MCard-StarterKit is a public-safe starter kit for experimenting with **Electronic Badge, NFC Bluetooth Animated GIF Trendy Toy Keychain-like devices**.

It helps you build and test the full local workflow around a Bluetooth animated badge without relying on vendor cloud services or captured application code.

```mermaid
flowchart LR
  Profile[Device profile] --> Media[Media / animation]
  Media --> Package[Local package]
  Package --> Frames[CONTROL / FILE / OTA frames]
  Frames --> Transport[Emulator or BLE transport]
  Transport --> Notify[Notify responses]
  Notify --> Parser[Parser / response mapping]
  Parser --> Retry[ACK matcher / retry scheduler]
  Retry --> Workspace[Logs / workspace export]
```

### Feature gallery

| Area | What you can do |
|---|---|
| **Profile Editor** | Edit device-like categories, commands, responses, transfer limits, and media limits as JSON |
| **Media Studio** | Prepare small static display media for badge-style screens |
| **Animation Studio** | Build frame-based animation manifests |
| **Browser-native Media Import** | Import GIF, APNG, WebP, or static image files through browser APIs |
| **Media Package Builder** | Convert local media into package JSON |
| **Profile Frame Lab** | Build profile-driven CONTROL, FILE, and OTA planning frames |
| **FILE Transfer Simulator** | Split packages into transfer frames and inspect packet plans |
| **Notify Parser Lab** | Parse notification hex into normalized response objects |
| **JSON Rule Parser Lab** | Add safe parser behavior with JSON rules instead of executable plugins |
| **Retry Scheduler Lab** | Test ACK/NACK, lost packet, and retry state behavior |
| **Emulator Notify Simulator** | Generate virtual notifications without hardware |
| **Web Bluetooth Transport** | Write frames through browser BLE only after explicit user confirmation |
| **Windows BLE Peripheral Sample** | Run a local GATT peripheral sample for transport testing on Windows |
| **OTA Local Verifier** | Build and verify synthetic local package containers without flashing firmware |
| **Transfer-time Estimator** | Estimate transfer duration from profile settings and packet counts |
| **Workspace Tools** | Export/import local project state for repeatable experiments |

## What it is not

MCard-StarterKit is not a vendor app clone, firmware flasher, cloud client, or production hardware certification package.

```text
No vendor cloud calls
No official assets
No captured application code
No firmware blobs
No private identifiers
No automatic BLE writes
```

## Safety summary

- Local-first.
- No vendor cloud calls.
- No official assets.
- No captured application code.
- No firmware blobs.
- BLE writes are opt-in.
- OTA tooling is local verification and planning only.

## 5-minute Quickstart

```bash
npm test
PORT=3000 npm start
```

Open:

```text
http://127.0.0.1:3000
```

Health check:

```bash
curl -s http://127.0.0.1:3000/api/health
```

Expected response:

```json
{
  "ok": true
}
```

### First local success path

```mermaid
flowchart TD
  A[Start local server] --> B[Open dashboard]
  B --> C[Load sample profile]
  C --> D[Build or import small media]
  D --> E[Build media package]
  E --> F[Build profiled FILE frames]
  F --> G[Simulate notify]
  G --> H[Parse response]
  H --> I[Confirm ACK / retry state]
  I --> J[Export workspace]
```

### Minimal API check

After `PORT=3000 npm start`, this response parser smoke check should return `matched: true`:

```bash
curl -s -X POST http://127.0.0.1:3000/api/response/parse \
  -H "Content-Type: application/json" \
  -d '{"group":"file","hex":"04 00 0a 00 09 00 06 00 00 00 01 00 00 00"}'
```

## Architecture

```mermaid
flowchart TD
  subgraph Browser
    UI[Dashboard UI]
    WebBT[Web Bluetooth opt-in]
    NativeImport[ImageDecoder / createImageBitmap import]
  end

  subgraph LocalServer
    API[Node.js API]
    Docs[Docs endpoint]
  end

  subgraph Packages
    FrameBuilder[Frame builder]
    Parser[Parsers and response maps]
    Emulator[Emulator notify]
    Retry[ACK matcher and retry scheduler]
    Verifier[OTA local verifier]
    Estimator[Transfer estimator]
  end

  subgraph Examples
    Profiles[Sample profiles]
    Rules[JSON parser rules]
    Vectors[Test vectors]
  end

  UI --> API
  NativeImport --> UI
  UI --> WebBT
  API --> FrameBuilder
  API --> Parser
  API --> Emulator
  API --> Retry
  API --> Verifier
  API --> Estimator
  Profiles --> FrameBuilder
  Rules --> Parser
  Vectors --> Parser
```

## Repository map

```text
apps/
  web/                         local dashboard
  windows-ble-peripheral/      Windows GATT peripheral sample

packages/
  frame-builder/               profile-driven frame creation
  notify-parsers/              notification parser registry
  response-mapping/            FILE / OTA response mapping
  control-response-mapping/    CONTROL response mapping
  retry-scheduler/             retry state machine
  ack-matcher/                 per-packet ACK matching
  transport/                   transport abstraction
  transport-adapters/          log adapters
  emulator-notify/             virtual notify generator
  ota-local-verifier/          synthetic package verifier
  media-tools/                 media estimates and frame planning
  transfer-estimator/          transfer-time estimates
  json-rule-parser/            safe JSON parser rules

examples/
  profiles/                    sample profiles
  plugins/                     JSON rule parser examples
  responses/                   response fixtures
  test-vectors/                protocol vectors

docs/
  English documentation

docs-ja/
  Japanese documentation
```

## Documentation

| Document | Description |
|---|---|
| [User guide](docs/USER_GUIDE.md) | First dashboard workflow with panel names, actions, and expected outputs |
| [Developer guide](docs/DEVELOPER_GUIDE.md) | Code reading order, module responsibilities, examples, and change checklists |
| [MoniCard-like profile notes](docs/MONICARD_LIKE_PROFILE_NOTES.md) | Public-safe compatibility model and implementation mapping |
| [Protocol reference](docs/PROTOCOL_REFERENCE.md) | Byte-level frame shapes, hex examples, offset tables, and parse results |
| [Media guide](docs/MEDIA_GUIDE.md) | Browser-native import, package generation, and estimator notes |
| [Transport guide](docs/TRANSPORT_GUIDE.md) | Emulator, Web Bluetooth, Windows peripheral, logs, and retry flow |
| [Hardware planning](docs/HARDWARE.md) | BOM, bring-up order, and hardware caution notes |
| [Security model](docs/SECURITY.md) | Clean-room boundaries, threat model, and BLE safety rules |

Japanese docs are available in [`docs-ja/`](docs-ja/README.md).

## Clean-room policy

Do not add:

- vendor endpoints,
- official assets,
- captured application code,
- firmware blobs,
- private identifiers,
- HAR files,
- extracted package artifacts.

When behavior is device-specific, put it in profiles, JSON rules, fixtures, or documentation. Keep generic packages profile-driven.

## Development

```bash
npm test
npm start
```

Before opening a pull request, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT. See [`LICENSE`](LICENSE).

---

<p align="center">
  Built for local experiments, tiny screens, packet puzzles, and the particular joy of making plastic rectangles blink on purpose.
</p>
