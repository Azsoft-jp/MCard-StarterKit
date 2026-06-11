import assert from 'node:assert/strict';
import { estimateMediaPackage, makeFrameOptimizationPlan } from '../packages/media-tools/index.mjs';

const tinyPng = 'data:image/png;base64,' + Buffer.from('abc').toString('base64');
const estimate = estimateMediaPackage({ type: 'image', target: { width: 240, height: 320 }, image: { dataUrl: tinyPng } }, { media: { maxPackageBytes: 2 } });
assert.equal(estimate.overLimit, true);

const animation = { frames: Array.from({ length: 10 }, (_, index) => ({ index, durationMs: 10 })) };
const plan = makeFrameOptimizationPlan(animation, { maxFrames: 5, minDurationMs: 80 });
assert.equal(plan.outputFrameCount, 5);
assert.equal(plan.frames[0].durationMs, 80);

console.log('media tools tests passed');
