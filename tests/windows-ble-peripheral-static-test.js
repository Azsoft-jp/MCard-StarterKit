const assert = require('assert');
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '../apps/windows-ble-peripheral/MCardBlePeripheral');
const csproj = fs.readFileSync(path.join(base, 'MCardBlePeripheral.csproj'), 'utf8');
const program = fs.readFileSync(path.join(base, 'Program.cs'), 'utf8');
const engine = fs.readFileSync(path.join(base, 'VirtualNotifyEngine.cs'), 'utf8');
const options = fs.readFileSync(path.join(base, 'PeripheralOptions.cs'), 'utf8');
const scripts = path.join(__dirname, '../apps/windows-ble-peripheral/scripts');
const localLauncher = fs.readFileSync(
  path.join(scripts, 'run-local-test-peripheral.ps1'),
  'utf8'
);
const packagedLauncher = fs.readFileSync(
  path.join(scripts, 'run-packaged-emulator.ps1'),
  'utf8'
);
const packager = fs.readFileSync(path.join(scripts, 'package-release.ps1'), 'utf8');
const workflow = fs.readFileSync(
  path.join(__dirname, '../.github/workflows/windows-emulator-release.yml'),
  'utf8'
);

assert.match(csproj, /net8\.0-windows10\.0\.19041\.0/);
assert.match(program, /GattServiceProvider/);
assert.match(program, /CreateCharacteristicAsync/);
assert.match(program, /NotifyValueAsync/);
assert.match(options, /i-understand-this-is-local-test-peripheral/);
assert.match(engine, /BuildControlNotify/);
assert.match(engine, /BuildLengthPrefixedAck/);
assert.doesNotMatch(program + engine + options, /firmware download/i);
assert.match(localLauncher, /7a2f0002-2b3c-4d5e-8f90-000000000000/);
assert.match(localLauncher, /7a2f0003-2b3c-4d5e-8f90-000000000000/);
assert.match(packagedLauncher, /i-understand-this-is-local-test-peripheral/);
assert.match(packagedLauncher, /MCardBlePeripheral\.exe/);
assert.match(packager, /"publish"/);
assert.match(packager, /dotnet @PublishArguments/);
assert.match(packager, /"--self-contained", "true"/);
assert.match(packager, /--no-restore/);
assert.match(packager, /SHA256SUMS/);
assert.match(workflow, /runs-on: windows-latest/);
assert.match(workflow, /tags:\s*\n\s+- "v\*"/);
assert.match(workflow, /actions\/checkout@v6/);
assert.match(workflow, /actions\/setup-dotnet@v4/);
assert.match(workflow, /dotnet restore/);
assert.match(workflow, /--runtime win-x64/);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.match(workflow, /gh release upload/);
assert.match(workflow, /SHA256SUMS-windows/);
assert.doesNotMatch(workflow, /pull_request:/);

console.log('windows ble peripheral static test passed');
