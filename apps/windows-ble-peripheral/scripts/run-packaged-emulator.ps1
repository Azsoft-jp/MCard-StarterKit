$ErrorActionPreference = "Stop"

$Executable = Join-Path $PSScriptRoot "app\MCardBlePeripheral.exe"

if (-not (Test-Path $Executable)) {
  throw "Packaged emulator executable not found: $Executable"
}

& $Executable `
  --i-understand-this-is-local-test-peripheral `
  --service "7a2f0000-2b3c-4d5e-8f90-000000000000" `
  --write "7a2f0002-2b3c-4d5e-8f90-000000000000" `
  --notify "7a2f0003-2b3c-4d5e-8f90-000000000000"
