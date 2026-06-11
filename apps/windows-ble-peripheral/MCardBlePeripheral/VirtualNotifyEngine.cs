using System;
using System.Text;

namespace MCardBlePeripheral;

internal static class VirtualNotifyEngine
{
    public static byte[] BuildNotify(byte[] request)
    {
        if (request.Length < 4)
        {
            return Array.Empty<byte>();
        }

        byte category = request[0];
        byte fragment = request[1];
        ushort payloadLength = Le.ReadU16(request, 2);
        if ((fragment == 0 || fragment == 1) && request.Length - 4 != payloadLength)
        {
            return Array.Empty<byte>();
        }

        byte[] payload = request[4..];
        if (payload.Length < 2)
        {
            return Array.Empty<byte>();
        }

        ushort command = Le.ReadU16(payload, 0);

        return category switch
        {
            0x1f => BuildControlNotify(command),
            0x04 => BuildLengthPrefixedAck(category, command, payload),
            0x01 => BuildLengthPrefixedAck(category, command, payload),
            _ => Array.Empty<byte>()
        };
    }

    private static byte[] BuildControlNotify(ushort command)
    {
        return command switch
        {
            18 => Frame.Control(0x1f, 19, Encoding.ASCII.GetBytes("MCARD-SAMPLE-0001")),
            20 => Frame.Control(0x1f, 21, Encoding.ASCII.GetBytes("0.1.0")),
            22 => Frame.Control(0x1f, 23, Le.U16(87)),
            32 => Frame.Control(0x1f, 33, Bytes.Concat(Le.U32(4096), Le.U32(2048), Le.U32(1024))),
            40 => Frame.Control(0x1f, 41, new byte[] { 1, 1, 1, 0, 0, 1, 0, 0 }),
            60 => Frame.Control(0x1f, 61, Le.U16(5)),
            _ => Frame.Control(0x1f, (ushort)(command + 1), Le.U16(0))
        };
    }

    private static byte[] BuildLengthPrefixedAck(byte category, ushort requestCommand, byte[] requestPayload)
    {
        ushort responseCommand = (category, requestCommand) switch
        {
            (0x04, 0) => 1,
            (0x04, 2) => 3,
            (0x04, 6) => 7,
            (0x04, 8) => 9,
            (0x04, 10) => 11,
            (0x04, 13) => 14,
            (0x01, 38) => 39,
            (0x01, 40) => 41,
            (0x01, 42) => 43,
            _ => (ushort)(requestCommand + 1)
        };

        uint packetIndex = ExtractPacketIndex(requestPayload);
        byte[] data = Bytes.Concat(Le.U16(0), Le.U32(packetIndex));
        return Frame.LengthPrefixed(category, responseCommand, data);
    }

    private static uint ExtractPacketIndex(byte[] requestPayload)
    {
        // Length-prefixed request payload layout: command u16, length u16, data.
        if (requestPayload.Length >= 8)
        {
            return Le.ReadU32(requestPayload, 4);
        }

        return 1;
    }
}
