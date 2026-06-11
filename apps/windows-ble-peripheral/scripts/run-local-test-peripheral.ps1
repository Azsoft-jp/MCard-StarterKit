$ErrorActionPreference = "Stop"

$Project = Join-Path $PSScriptRoot "..\MCardBlePeripheral\MCardBlePeripheral.csproj"

dotnet run --project $Project -c Release -- `
  --i-understand-this-is-local-test-peripheral `
  --service "7a2f0000-2b3c-4d5e-8f90-000000000000" `
  --write "7a2f0002-2b3c-4d5e-8f90-000000000000" `
  --notify "7a2f0002-2b3c-4d5e-8f90-000000000000"
