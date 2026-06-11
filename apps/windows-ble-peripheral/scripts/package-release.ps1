param(
  [Parameter(Mandatory = $true)]
  [string]$Version,

  [string]$OutputDirectory = "release",

  [switch]$NoRestore
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$Project = Join-Path $ProjectRoot "apps\windows-ble-peripheral\MCardBlePeripheral\MCardBlePeripheral.csproj"
$PackageName = "mcardkit-windows-emulator-$($Version.Replace('/', '-'))-win-x64"
$OutputRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot $OutputDirectory))
$PackageDirectory = Join-Path $OutputRoot $PackageName
$PublishDirectory = Join-Path $PackageDirectory "app"
$ArchivePath = Join-Path $OutputRoot "$PackageName.zip"

if (Test-Path $PackageDirectory) {
  Remove-Item $PackageDirectory -Recurse -Force
}
if (Test-Path $ArchivePath) {
  Remove-Item $ArchivePath -Force
}

New-Item $PublishDirectory -ItemType Directory -Force | Out-Null

$PublishArguments = @(
  "publish",
  $Project,
  "--configuration", "Release",
  "--runtime", "win-x64",
  "--self-contained", "true",
  "-p:Platform=x64",
  "-p:DebugType=None",
  "-p:DebugSymbols=false",
  "--output", $PublishDirectory
)
if ($NoRestore) {
  $PublishArguments += "--no-restore"
}

dotnet @PublishArguments

Copy-Item (Join-Path $ProjectRoot "apps\windows-ble-peripheral\README.md") `
  (Join-Path $PackageDirectory "README.md")
Copy-Item (Join-Path $PSScriptRoot "run-packaged-emulator.ps1") `
  (Join-Path $PackageDirectory "run-local-test-peripheral.ps1")

@"
Public-safe MCard-StarterKit Windows BLE peripheral emulator.

Target:
  Windows 10 2004 or later, x64
  Bluetooth adapter and driver with peripheral-role support

Start:
  .\run-local-test-peripheral.ps1

The launcher passes the required local-test consent flag explicitly.
This package is unofficial test software. It does not contain vendor
firmware, contact vendor services, or flash another device.
"@ | Set-Content (Join-Path $PackageDirectory "PACKAGE-NOTICE.txt") -Encoding utf8

$ChecksumFile = Join-Path $PackageDirectory "SHA256SUMS"
Get-ChildItem $PackageDirectory -File -Recurse |
  Where-Object { $_.FullName -ne $ChecksumFile } |
  Sort-Object FullName |
  ForEach-Object {
    $relative = [System.IO.Path]::GetRelativePath($PackageDirectory, $_.FullName).Replace('\', '/')
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $relative"
  } | Set-Content $ChecksumFile -Encoding ascii

Compress-Archive -Path $PackageDirectory -DestinationPath $ArchivePath
Write-Host "Created $ArchivePath"
