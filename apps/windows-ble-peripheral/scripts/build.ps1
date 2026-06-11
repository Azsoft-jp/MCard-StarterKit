$ErrorActionPreference = "Stop"

$Project = Join-Path $PSScriptRoot "..\MCardBlePeripheral\MCardBlePeripheral.csproj"

Write-Host "Building MCardBlePeripheral..."
dotnet build $Project -c Release -p:Platform=x64
