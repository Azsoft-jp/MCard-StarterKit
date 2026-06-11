# nRF52 BLE peripheral emulator

This Arduino/PlatformIO example turns an nRF52840 DK into a public-safe,
unofficial BLE peripheral for local MCard-StarterKit transport tests. It uses
the Arduino Bluefruit API supplied by PlatformIO's Adafruit BSP board target
`nrf52840_dk_adafruit`.

It does not connect to external services, flash another device, or implement a
real firmware update. OTA-category writes receive planning ACKs only.

## Build and upload

Install PlatformIO, connect an nRF52840 DK, then run:

```bash
pio run -d examples/nrf52-ble-peripheral
pio run -d examples/nrf52-ble-peripheral -t upload
pio device monitor -b 115200
```

Board upload and serial interfaces vary by host. Pass `--upload-port <port>` or
`--port <port>` when automatic selection is not correct.

## Connect from the dashboard

1. Start the local dashboard with `npm start`.
2. Open `http://127.0.0.1:3000` in a Chromium-based browser.
3. Enter the sample service, write, and notify UUIDs from
   `include/mcard_profile.h` in Web Bluetooth Transport.
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
defined for the selected board.
