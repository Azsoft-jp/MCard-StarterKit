const assert = require('assert');
const fs = require('fs');
const path = require('path');

const sample = JSON.parse(fs.readFileSync(path.join(__dirname, '../examples/media/example-image.mcpkg.json'), 'utf8'));
assert.strictEqual(sample.schema, 'mcard-starterkit.media-package.v1');
assert.ok(sample.image.dataUrl.startsWith('data:image/png;base64,'));
console.log('smoke test passed');
