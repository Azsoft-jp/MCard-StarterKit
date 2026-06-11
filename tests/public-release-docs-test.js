const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

for (const rel of [
  'README.md',
  'docs/README.md',
  'docs/USER_GUIDE.md',
  'docs/DEVELOPER_GUIDE.md',
  'docs/MONICARD_LIKE_PROFILE_NOTES.md',
  'docs/PROTOCOL_REFERENCE.md',
  'docs/MEDIA_GUIDE.md',
  'docs/TRANSPORT_GUIDE.md',
  'docs/HARDWARE.md',
  'docs/SECURITY.md',
  'docs-ja/README.md'
]) {
  assert.ok(fs.existsSync(path.join(root, rel)), `${rel} missing`);
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert.match(readme, /Quickstart/);
assert.match(readme, /Safety summary/);
assert.ok(!/Pass \d+/.test(readme), 'public README should not contain pass logs');

const docsMd = fs.readdirSync(path.join(root, 'docs')).filter((name) => name.endsWith('.md')).sort();
assert.deepStrictEqual(docsMd, [
  'DEVELOPER_GUIDE.md',
  'HARDWARE.md',
  'MEDIA_GUIDE.md',
  'MONICARD_LIKE_PROFILE_NOTES.md',
  'PROTOCOL_REFERENCE.md',
  'README.md',
  'SECURITY.md',
  'TRANSPORT_GUIDE.md',
  'USER_GUIDE.md'
].sort());

console.log('public release docs test passed');


const developerGuide = fs.readFileSync(path.join(root, 'docs/DEVELOPER_GUIDE.md'), 'utf8');
const protocolReference = fs.readFileSync(path.join(root, 'docs/PROTOCOL_REFERENCE.md'), 'utf8');
const userGuide = fs.readFileSync(path.join(root, 'docs/USER_GUIDE.md'), 'utf8');

assert.match(developerGuide, /Suggested reading order/);
assert.match(developerGuide, /```mermaid/);
assert.match(protocolReference, /Example FILE data response ACK/);
assert.match(protocolReference, /Normalized parse result/);
assert.match(userGuide, /First successful local flow/);
assert.match(userGuide, /```mermaid/);
console.log('public release docs mermaid/detail checks passed');


const contributing = fs.readFileSync(path.join(root, 'CONTRIBUTING.md'), 'utf8');
const transportGuide = fs.readFileSync(path.join(root, 'docs/TRANSPORT_GUIDE.md'), 'utf8');
const moniNotes = fs.readFileSync(path.join(root, 'docs/MONICARD_LIKE_PROFILE_NOTES.md'), 'utf8');

assert.match(contributing, /Before opening a PR/);
assert.match(transportGuide, /Which transport should I use/);
assert.match(moniNotes, /Confidence labels/);
assert.match(protocolReference, /Offset tables/);

console.log('public release docs checklist/detail checks passed');


for (const rel of [
  'docs-ja/README.md',
  'docs-ja/USER_GUIDE.md',
  'docs-ja/DEVELOPER_GUIDE.md',
  'docs-ja/PROTOCOL_REFERENCE.md',
  'docs-ja/MEDIA_GUIDE.md',
  'docs-ja/TRANSPORT_GUIDE.md',
  'docs-ja/MONICARD_LIKE_PROFILE_NOTES.md',
  'docs-ja/HARDWARE.md',
  'docs-ja/SECURITY.md'
]) {
  const body = fs.readFileSync(path.join(root, rel), 'utf8');
  assert.ok(!body.includes('英語版をベース'), `${rel} still contains partial-translation disclaimer`);
  assert.ok(body.length > 500, `${rel} looks too short`);
}
console.log('Japanese docs translation checks passed');


const rootReadme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
assert.match(rootReadme, /What can it do/);
assert.match(rootReadme, /Feature gallery/);
assert.match(rootReadme, /What it is not/);
assert.match(rootReadme, /Safety summary/);
assert.match(rootReadme, /Architecture/);
assert.match(rootReadme, /img\.shields\.io/);
console.log('fancy README checks passed');
