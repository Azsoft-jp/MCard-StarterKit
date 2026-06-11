namespace MCardBlePeripheral;

internal static class Frame
{
    public static byte[] Control(byte category, ushort command, byte[] data)
    {
        return Outer(category, 0, Bytes.Concat(Le.U16(command), data));
    }

    public static byte[] LengthPrefixed(byte category, ushort command, byte[] data)
    {
        return Outer(category, 0, Bytes.Concat(Le.U16(command), Le.U16((ushort)data.Length), data));
    }

    public static byte[] Outer(byte category, byte fragmentState, byte[] payload)
    {
        return Bytes.Concat(new[] { category, fragmentState }, Le.U16((ushort)payload.Length), payload);
    }
}
