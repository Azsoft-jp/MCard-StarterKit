export function estimateTransferTime(plan = {}, profile = {}, options = {}) {
  const totalFrameBytes = Number(plan.totalFrameBytesApprox ?? plan.totalFrameBytes ?? sumFrameBytes(plan.frames || []));
  const totalPackets = Number(plan.totalPackets ?? plan.frames?.length ?? 0);
  const mtu = Number(options.mtu ?? profile.transfer?.defaultMtu ?? plan.mtu ?? 247);
  const writesPerSecond = Number(options.writesPerSecond ?? profile.transfer?.writesPerSecond ?? 18);
  const ackDelayMs = Number(options.ackDelayMs ?? profile.transfer?.ackDelayMs ?? 35);
  const connectionIntervalMs = Number(options.connectionIntervalMs ?? profile.transfer?.connectionIntervalMs ?? 30);
  const retryRate = Number(options.retryRate ?? profile.transfer?.retryRate ?? 0.02);
  const maxPackageBytes = Number(profile.media?.maxPackageBytes ?? 1024 * 1024);

  const effectiveWritesPerSecond = Math.max(0.1, writesPerSecond);
  const writeTimeMs = totalPackets > 0 ? (totalPackets / effectiveWritesPerSecond) * 1000 : 0;
  const ackTimeMs = totalPackets * ackDelayMs;
  const intervalFloorMs = totalPackets * connectionIntervalMs;
  const retryPackets = Math.ceil(totalPackets * Math.max(0, retryRate));
  const retryTimeMs = retryPackets > 0 ? (retryPackets / effectiveWritesPerSecond) * 1000 + retryPackets * ackDelayMs : 0;
  const estimatedMs = Math.ceil(Math.max(writeTimeMs + ackTimeMs, intervalFloorMs) + retryTimeMs);

  const warnings = [];
  if (totalFrameBytes > maxPackageBytes) warnings.push(`estimated transfer bytes exceed profile maxPackageBytes ${maxPackageBytes}`);
  if (writesPerSecond > 30) warnings.push('writesPerSecond is optimistic for many browser BLE stacks');
  if (mtu < 64) warnings.push('low MTU may substantially reduce throughput');

  return {
    profileId: profile.id || 'anonymous-profile',
    mtu,
    totalPackets,
    totalFrameBytes,
    writesPerSecond,
    ackDelayMs,
    connectionIntervalMs,
    retryRate,
    retryPackets,
    estimatedMs,
    estimatedSeconds: Number((estimatedMs / 1000).toFixed(2)),
    estimatedMinutes: Number((estimatedMs / 60000).toFixed(2)),
    maxPackageBytes,
    warnings
  };
}

function sumFrameBytes(frames) {
  return frames.reduce((sum, frame) => {
    if (frame.frameLength) return sum + Number(frame.frameLength);
    if (frame.frameHex) return sum + Math.ceil(String(frame.frameHex).replace(/[^0-9a-fA-F]/g, '').length / 2);
    return sum;
  }, 0);
}
