# V1 public protocol

This dependency-free CommonJS module is the host-side reference for the
ESP32-S3 PR-4 firmware skeleton.

```js
const {
  CONTROL_COMMAND,
  buildControlFrame,
  buildDeterministicResponse,
  parseFrame
} = require('./packages/v1-protocol');

const request = buildControlFrame(CONTROL_COMMAND.GET_VERSION);
const response = buildDeterministicResponse(request);
console.log(parseFrame(response));
```

The frame model is public-safe and profile-like:

- Outer frame: category, fragment state, uint16 little-endian payload length,
  then payload.
- CONTROL payload: uint16 little-endian command, then data.
- FILE / OTA payload: uint16 command, uint16 data length, then data.
- Categories: OTA `0x01`, FILE `0x04`, CONTROL `0x1f`.

The deterministic sample commands are PING, GET_SERIAL, GET_VERSION,
GET_BATTERY, and GET_FS_INFO. FILE commands receive local sample ACKs. OTA
commands receive planning ACKs only; this package does not flash firmware or
communicate with a cloud service.
