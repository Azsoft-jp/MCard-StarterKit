const assert = require('assert');
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '../apps/windows-ble-peripheral/MCardBlePeripheral');
const csproj = fs.readFileSync(path.join(base, 'MCardBlePeripheral.csproj'), 'utf8');
const program = fs.readFileSync(path.join(base, 'Program.cs'), 'utf8');
const engine = fs.readFileSync(path.join(base, 'VirtualNotifyEngine.cs'), 'utf8');
const options = fs.readFileSync(path.join(base, 'PeripheralOptions.cs'), 'utf8');

assert.match(csproj, /net8\.0-windows10\.0\.19041\.0/);
assert.match(program, /GattServiceProvider/);
assert.match(program, /CreateCharacteristicAsync/);
assert.match(program, /NotifyValueAsync/);
assert.match(options, /i-understand-this-is-local-test-peripheral/);
assert.match(engine, /BuildControlNotify/);
assert.match(engine, /BuildLengthPrefixedAck/);
assert.doesNotMatch(program + engine + options, /firmware download/i);

console.log('windows ble peripheral static test passed');
