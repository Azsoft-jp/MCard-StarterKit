import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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

const generatedDirectories = new Set([
  '.git',
  '.pio',
  'node_modules',
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (generatedDirectories.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function relativePath(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function trackedGeneratedFiles() {
  const result = spawnSync('git', ['ls-files', ':(glob)**/.pio/**'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0 && !result.stdout) {
    return [];
  }
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => path.join(root, file));
}

const filesToAudit = new Map();
for (const file of walk(root)) {
  filesToAudit.set(relativePath(file), file);
}
for (const file of trackedGeneratedFiles()) {
  if (fs.existsSync(file)) filesToAudit.set(relativePath(file), file);
}

let failed = false;
for (const file of filesToAudit.values()) {
  const rel = relativePath(file);
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
