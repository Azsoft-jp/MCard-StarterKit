using System;
using System.Linq;

namespace MCardBlePeripheral;

internal static class Hex
{
    public static string ToSpaced(byte[] bytes)
    {
        return string.Join(" ", bytes.Select(b => b.ToString("x2")));
    }

    public static byte[] FromString(string value)
    {
        string compact = new string(value.Where(Uri.IsHexDigit).ToArray());
        if (compact.Length % 2 != 0)
        {
            throw new ArgumentException("Hex string must contain an even number of digits.");
        }

        byte[] output = new byte[compact.Length / 2];
        for (int i = 0; i < compact.Length; i += 2)
        {
            output[i / 2] = Convert.ToByte(compact.Substring(i, 2), 16);
        }

        return output;
    }
}
