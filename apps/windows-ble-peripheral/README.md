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

## Prebuilt release package

Tags matching `v*` trigger
`.github/workflows/windows-emulator-release.yml`. The workflow publishes a
self-contained Windows x64 package:

```text
mcardkit-windows-emulator-<tag>-win-x64.zip
```

Extract the ZIP and run:

```powershell
.\run-local-test-peripheral.ps1
```

The package contains the published executable, launcher, source README,
package notice, and per-file SHA-256 checksums. A manual workflow run creates a
temporary Actions artifact without publishing a GitHub Release.

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
