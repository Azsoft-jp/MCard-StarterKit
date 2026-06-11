# Documentation

MCard-StarterKit is a local-first clean-room starter kit for Bluetooth animated badge experiments.

## Start here

```mermaid
flowchart LR
  R[README] --> U[User guide]
  U --> D[Developer guide]
  D --> P[Protocol reference]
  D --> M[MoniCard-like profile notes]
  D --> T[Transport guide]
  D --> S[Security model]
```

## Documents

- [User guide](USER_GUIDE.md)
- [Developer guide](DEVELOPER_GUIDE.md)
- [MoniCard-like profile notes](MONICARD_LIKE_PROFILE_NOTES.md)
- [Protocol reference](PROTOCOL_REFERENCE.md)
- [Media and package guide](MEDIA_GUIDE.md)
- [Transport guide](TRANSPORT_GUIDE.md)
- [Hardware planning](HARDWARE.md)
- [Security model](SECURITY.md)

## Developer reading paths

```mermaid
flowchart TD
  Goal{What are you changing?}
  Goal -->|Add a profile| Profile[MONICARD_LIKE_PROFILE_NOTES + examples/profiles]
  Goal -->|Debug frames| Proto[PROTOCOL_REFERENCE + packages/frame-builder]
  Goal -->|Debug ACK/retry| Retry[TRANSPORT_GUIDE + ack-matcher + retry-scheduler]
  Goal -->|Add parser behavior| Parser[DEVELOPER_GUIDE + json-rule-parser]
  Goal -->|Media import| Media[MEDIA_GUIDE + packages/media-tools]
  Goal -->|BLE behavior| Transport[TRANSPORT_GUIDE + transport adapters]
```

## Principles

- Keep device behavior profile-driven.
- Keep transfer and parser logic local-first.
- Keep BLE writes explicit and opt-in.
- Do not include vendor assets, cloud endpoints, captured app code, firmware blobs, or private identifiers.
