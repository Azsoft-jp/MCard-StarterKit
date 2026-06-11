export function estimateMediaPackage(pkg = {}, profile = {}) {
  const warnings = [];
  const target = pkg.target || { width: 240, height: 320 };
  const maxBytes = Number(profile.media?.maxPackageBytes ?? 1024 * 1024);
  let payloadBytesApprox = 0;
  let frameCount = 0;

  if (pkg.image?.dataUrl) {
    payloadBytesApprox = estimateDataUrlBytes(pkg.image.dataUrl);
    frameCount = 1;
  }

  if (pkg.animation?.frames?.length) {
    frameCount = pkg.animation.frames.length;
    payloadBytesApprox = pkg.animation.frames.reduce((sum, frame) => sum + estimateDataUrlBytes(frame.dataUrl || ''), 0);
  }

  if (payloadBytesApprox > maxBytes) {
    warnings.push(`package exceeds profile maxPackageBytes ${maxBytes}`);
  }

  if (target.width !== 240 || target.height !== 320) {
    warnings.push('target size differs from the default 240x320 display');
  }

  return {
    target,
    frameCount,
    payloadBytesApprox,
    maxBytes,
    overLimit: payloadBytesApprox > maxBytes,
    warnings
  };
}

export function makeFrameOptimizationPlan(animation = {}, options = {}) {
  const frames = animation.frames || [];
  const maxFrames = Number(options.maxFrames ?? 60);
  const minDurationMs = Number(options.minDurationMs ?? 80);
  const warnings = [];
  let selected = frames;

  if (frames.length > maxFrames) {
    const step = Math.ceil(frames.length / maxFrames);
    selected = frames.filter((_, index) => index % step === 0).slice(0, maxFrames);
    warnings.push(`downsampled frames from ${frames.length} to ${selected.length}`);
  }

  const optimizedFrames = selected.map((frame, index) => ({
    ...frame,
    index,
    durationMs: Math.max(Number(frame.durationMs ?? minDurationMs), minDurationMs)
  }));

  return {
    originalFrameCount: frames.length,
    outputFrameCount: optimizedFrames.length,
    minDurationMs,
    frames: optimizedFrames,
    warnings
  };
}

export function estimateDataUrlBytes(dataUrl) {
  const marker = 'base64,';
  const idx = String(dataUrl).indexOf(marker);
  if (idx < 0) return 0;
  const base64Length = String(dataUrl).length - idx - marker.length;
  return Math.max(0, Math.floor(base64Length * 0.75));
}
