# Windows BLE Peripheral

This is an opt-in Windows GATT peripheral sample for MCard-StarterKit.

## Requirements

- Windows 10 2004 or later
- Bluetooth adapter that supports peripheral role
- .NET 8 SDK
- Windows SDK support through `net8.0-windows10.0.19041.0`

## Build

```powershell
apps/windows-ble-peripheral/scripts/build.ps1
```

## Run

```powershell
apps/windows-ble-peripheral/scripts/run-local-test-peripheral.ps1
```

The app refuses to start unless the explicit local-test consent flag is provided.

## Behavior

- Advertises the configured service UUID.
- Exposes a writable characteristic.
- Exposes a notify characteristic.
- On CONTROL / FILE / OTA writes, returns virtual notify frames.
- Does not flash firmware.
- Does not contact cloud services.
