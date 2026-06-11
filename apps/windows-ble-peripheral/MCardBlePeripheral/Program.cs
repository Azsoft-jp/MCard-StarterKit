using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Windows.Devices.Bluetooth;
using Windows.Devices.Bluetooth.GenericAttributeProfile;
using Windows.Storage.Streams;

namespace MCardBlePeripheral;

internal static class Program
{
    private static GattServiceProvider? _provider;
    private static GattLocalCharacteristic? _writeCharacteristic;
    private static GattLocalCharacteristic? _notifyCharacteristic;

    public static async Task<int> Main(string[] args)
    {
        var options = PeripheralOptions.Parse(args);

        Console.WriteLine("MCard-StarterKit Windows BLE Peripheral");
        Console.WriteLine("Local-only opt-in test peripheral. No firmware flashing.");
        Console.WriteLine($"Service UUID: {options.ServiceUuid}");
        Console.WriteLine($"Write UUID:   {options.WriteCharacteristicUuid}");
        Console.WriteLine($"Notify UUID:  {options.NotifyCharacteristicUuid}");
        Console.WriteLine();

        if (!OperatingSystem.IsWindowsVersionAtLeast(10, 0, 19041))
        {
            Console.Error.WriteLine("Windows 10 2004 or later is required for this sample.");
            return 2;
        }

        if (!options.Consent)
        {
            Console.Error.WriteLine("Refusing to start without --i-understand-this-is-local-test-peripheral.");
            Console.Error.WriteLine("This prevents accidentally advertising a writable GATT service.");
            return 3;
        }

        var serviceResult = await GattServiceProvider.CreateAsync(options.ServiceUuid);
        if (serviceResult.Error != BluetoothError.Success)
        {
            Console.Error.WriteLine($"Failed to create service provider: {serviceResult.Error}");
            return 4;
        }

        _provider = serviceResult.ServiceProvider;

        var writeParameters = new GattLocalCharacteristicParameters
        {
            CharacteristicProperties = GattCharacteristicProperties.Write | GattCharacteristicProperties.WriteWithoutResponse,
            WriteProtectionLevel = GattProtectionLevel.Plain,
            UserDescription = "MCard StarterKit Write"
        };

        var writeResult = await _provider.Service.CreateCharacteristicAsync(options.WriteCharacteristicUuid, writeParameters);
        if (writeResult.Error != BluetoothError.Success)
        {
            Console.Error.WriteLine($"Failed to create write characteristic: {writeResult.Error}");
            return 5;
        }

        _writeCharacteristic = writeResult.Characteristic;
        _writeCharacteristic.WriteRequested += OnWriteRequested;

        var notifyParameters = new GattLocalCharacteristicParameters
        {
            CharacteristicProperties = GattCharacteristicProperties.Notify | GattCharacteristicProperties.Read,
            ReadProtectionLevel = GattProtectionLevel.Plain,
            UserDescription = "MCard StarterKit Notify"
        };

        var notifyResult = await _provider.Service.CreateCharacteristicAsync(options.NotifyCharacteristicUuid, notifyParameters);
        if (notifyResult.Error != BluetoothError.Success)
        {
            Console.Error.WriteLine($"Failed to create notify characteristic: {notifyResult.Error}");
            return 6;
        }

        _notifyCharacteristic = notifyResult.Characteristic;

        var advParameters = new GattServiceProviderAdvertisingParameters
        {
            IsDiscoverable = true,
            IsConnectable = true
        };

        _provider.StartAdvertising(advParameters);
        Console.WriteLine("Advertising started. Press Ctrl+C to stop.");

        using var stop = new CancellationTokenSource();
        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            stop.Cancel();
        };

        try
        {
            await Task.Delay(Timeout.Infinite, stop.Token);
        }
        catch (TaskCanceledException)
        {
            // expected
        }

        _provider.StopAdvertising();
        Console.WriteLine("Advertising stopped.");
        return 0;
    }

    private static async void OnWriteRequested(GattLocalCharacteristic sender, GattWriteRequestedEventArgs args)
    {
        using var deferral = args.GetDeferral();

        try
        {
            var request = await args.GetRequestAsync();
            if (request is null)
            {
                return;
            }

            var reader = DataReader.FromBuffer(request.Value);
            var bytes = new byte[request.Value.Length];
            reader.ReadBytes(bytes);

            Console.WriteLine($"RX {bytes.Length} bytes: {Hex.ToSpaced(bytes)}");

            if (request.Option == GattWriteOption.WriteWithResponse)
            {
                request.Respond();
            }

            var notify = VirtualNotifyEngine.BuildNotify(bytes);
            if (notify.Length > 0 && _notifyCharacteristic is not null)
            {
                var writer = new DataWriter();
                writer.WriteBytes(notify);
                var status = await _notifyCharacteristic.NotifyValueAsync(writer.DetachBuffer());
                Console.WriteLine($"TX notify {notify.Length} bytes ({status}): {Hex.ToSpaced(notify)}");
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Write handler error: {ex.Message}");
        }
    }
}
