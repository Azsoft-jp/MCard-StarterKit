using System.Linq;

namespace MCardBlePeripheral;

internal static class Bytes
{
    public static byte[] Concat(params byte[][] parts)
    {
        byte[] output = new byte[parts.Sum(p => p.Length)];
        int offset = 0;
        foreach (byte[] part in parts)
        {
            part.CopyTo(output, offset);
            offset += part.Length;
        }
        return output;
    }
}
