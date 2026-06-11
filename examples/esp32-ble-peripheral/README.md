# ESP32 BLE peripheral emulator

This Arduino/PlatformIO example turns an ESP32 development board into a
public-safe, unofficial BLE peripheral for local MCard-StarterKit transport
tests. It uses only the neutral sample UUIDs and deterministic sample data.

It does not connect to external services, flash another device, or implement a
real firmware update. OTA-category writes receive planning ACKs only.

## Build and upload

Install PlatformIO, connect an `esp32dev`-compatible board, then run:

```bash
pio run -d examples/esp32-ble-peripheral
pio run -d examples/esp32-ble-peripheral -t upload
pio device monitor -b 115200
```

If PlatformIO cannot select the upload or monitor port automatically, add
`--upload-port <port>` or `--port <port>`.

## Connect from the dashboard

1. Start the local dashboard with `npm start`.
2. Open `http://127.0.0.1:3000` in a Chromium-based browser.
3. In Web Bluetooth Transport, enter the sample service, write, and notify
   UUIDs from `include/mcard_profile.h`.
4. Confirm that you own or are authorized to test the board.
5. Select Connect and choose `MCardKit-Emu`.
6. Enable notifications, then explicitly write a generated frame.

No BLE write or notification is initiated automatically at startup.

## Deterministic behavior

- CONTROL version query `1f 00 02 00 14 00` returns version `0.1.0`.
- Known CONTROL information queries return fixed sample values.
- Known FILE and OTA requests return a status-zero ACK.
- A four-byte packet index at the start of FILE/OTA data is echoed in the ACK;
  otherwise packet index `1` is used.
- Invalid or unknown frames print a warning and do not notify.

Example serial output:

```text
Advertising as MCardKit-Emu
BLE connected
RX 1F 00 02 00 14 00
TX 1F 00 07 00 15 00 30 2E 31 2E 30
```

The onboard LED is on while a central is connected when `LED_BUILTIN` is
available on the selected board.
