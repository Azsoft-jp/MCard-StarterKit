using System;

namespace MCardBlePeripheral;

internal sealed class PeripheralOptions
{
    public Guid ServiceUuid { get; init; } = Guid.Parse("7a2f0000-2b3c-4d5e-8f90-000000000000");
    public Guid WriteCharacteristicUuid { get; init; } = Guid.Parse("7a2f0002-2b3c-4d5e-8f90-000000000000");
    public Guid NotifyCharacteristicUuid { get; init; } = Guid.Parse("7a2f0002-2b3c-4d5e-8f90-000000000000");
    public bool Consent { get; init; }

    public static PeripheralOptions Parse(string[] args)
    {
        var options = new PeripheralOptions();

        Guid service = options.ServiceUuid;
        Guid write = options.WriteCharacteristicUuid;
        Guid notify = options.NotifyCharacteristicUuid;
        bool consent = false;

        for (int i = 0; i < args.Length; i++)
        {
            string current = args[i];

            if (current == "--i-understand-this-is-local-test-peripheral")
            {
                consent = true;
                continue;
            }

            if (current == "--service" && i + 1 < args.Length)
            {
                service = Guid.Parse(args[++i]);
                continue;
            }

            if (current == "--write" && i + 1 < args.Length)
            {
                write = Guid.Parse(args[++i]);
                continue;
            }

            if (current == "--notify" && i + 1 < args.Length)
            {
                notify = Guid.Parse(args[++i]);
                continue;
            }
        }

        return new PeripheralOptions
        {
            ServiceUuid = service,
            WriteCharacteristicUuid = write,
            NotifyCharacteristicUuid = notify,
            Consent = consent
        };
    }
}
