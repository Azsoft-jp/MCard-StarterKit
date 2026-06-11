import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const forbiddenExtensions = new Set(['.har', '.wxapkg', '.bsdiff', '.bin', '.firmware']);
const textTerms = [
  ['cloud','base'].join(''),
  ['wx','cloud'].join('.'),
  ['pre','wxacode'].join(''),
  ['launch','wxacode'].join(''),
  ['service','wechat'].join(''),
  ['my','qcloud'].join(''),
  ['open','id'].join(''),
  ['union','id'].join(''),
];

const ignoreFiles = new Set([
  'tools/repo-audit/audit-cleanroom.mjs',
  'BUILD_REPORT.txt',
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

let failed = false;
for (const file of walk(root)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (ignoreFiles.has(rel)) continue;

  const ext = path.extname(file).toLowerCase();
  if (forbiddenExtensions.has(ext)) {
    console.error(`[forbidden-file] ${rel}`);
    failed = true;
    continue;
  }

  if (/\.(png|jpg|jpeg|gif|ico|zip)$/i.test(file)) continue;

  const text = fs.readFileSync(file, 'utf8');
  for (const term of textTerms) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      console.error(`[forbidden] ${term} in ${rel}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('clean-room audit passed');
