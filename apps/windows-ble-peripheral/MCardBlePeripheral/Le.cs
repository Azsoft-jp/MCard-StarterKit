namespace MCardBlePeripheral;

internal static class Le
{
    public static ushort ReadU16(byte[] bytes, int offset)
    {
        return (ushort)(bytes[offset] | (bytes[offset + 1] << 8));
    }

    public static uint ReadU32(byte[] bytes, int offset)
    {
        return (uint)(bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24));
    }

    public static byte[] U16(ushort value)
    {
        return new[] { (byte)(value & 0xff), (byte)((value >> 8) & 0xff) };
    }

    public static byte[] U32(uint value)
    {
        return new[]
        {
            (byte)(value & 0xff),
            (byte)((value >> 8) & 0xff),
            (byte)((value >> 16) & 0xff),
            (byte)((value >> 24) & 0xff)
        };
    }
}
