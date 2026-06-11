const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../apps/web/public/index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../apps/web/public/app.js'), 'utf8');

assert.match(html, /Web Bluetooth Transport/);
assert.match(html, /bleConsentOwnDevice/);
assert.match(html, /bleWriteAllFrames/);
assert.match(js, /navigator\.bluetooth/);
assert.match(js, /requestDevice/);
assert.match(js, /writeValueWithoutResponse|writeValue/);
assert.match(js, /assertBleConsent/);

console.log('web bluetooth static test passed');
