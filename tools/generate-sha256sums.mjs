import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const excludedNames = new Set(['SHA256SUMS']);

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (!excludedNames.has(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of walk(root).sort()) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  process.stdout.write(`${hash}  ${relative}\n`);
}
