export function normalizeWebBluetoothLog(input = {}) {
  const events = Array.isArray(input) ? input : input.events || input.bleLog || [];
  return {
    schema: 'mcard-starterkit.transport-adapter-log.v1',
    adapter: 'web-bluetooth',
    events: events.map((event, index) => ({
      index,
      source: 'web-bluetooth',
      type: normalizeType(event.type),
      at: event.at || event.time || event.timestamp || null,
      frameHex: event.frameHex || event.hex || null,
      notifyHex: event.parsed ? event.hex : event.notifyHex || null,
      parsed: event.parsed || null,
      raw: event
    }))
  };
}

export function normalizeWindowsBridgeLog(textOrJson = '') {
  const lines = typeof textOrJson === 'string'
    ? textOrJson.split(/\r?\n/).filter(Boolean)
    : (textOrJson.lines || []);

  const events = lines.map((line, index) => {
    const rx = line.match(/RX\s+(\d+)\s+bytes:\s+(.+)$/i);
    if (rx) {
      return {
        index,
        source: 'windows-ble-peripheral',
        type: 'write',
        bytes: Number(rx[1]),
        frameHex: rx[2].trim(),
        rawLine: line
      };
    }

    const tx = line.match(/TX notify\s+(\d+)\s+bytes.*:\s+(.+)$/i);
    if (tx) {
      return {
        index,
        source: 'windows-ble-peripheral',
        type: 'notify',
        bytes: Number(tx[1]),
        notifyHex: tx[2].trim(),
        rawLine: line
      };
    }

    return {
      index,
      source: 'windows-ble-peripheral',
      type: 'info',
      rawLine: line
    };
  });

  return {
    schema: 'mcard-starterkit.transport-adapter-log.v1',
    adapter: 'windows-bridge-log',
    events
  };
}

export function mergeTransportLogs(...logs) {
  return {
    schema: 'mcard-starterkit.transport-merged-log.v1',
    createdAt: new Date().toISOString(),
    events: logs.flatMap((log) => log.events || [])
      .map((event, index) => ({ mergedIndex: index, ...event }))
  };
}

function normalizeType(type) {
  if (type === 'write-frame') return 'write';
  if (type === 'notify-frame') return 'notify';
  return type || 'info';
}
