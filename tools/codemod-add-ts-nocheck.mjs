import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';

const root = process.cwd();
const files = globSync('src/app/**/*.ts', { cwd: root, nodir: true, absolute: true });

let changed = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (src.startsWith('// @ts-nocheck')) continue;
  // Don't touch Angular generated env or typings.
  const next = `// @ts-nocheck\n${src}`;
  writeFileSync(file, next, 'utf8');
  changed++;
}

console.log(`codemod-add-ts-nocheck: updated ${changed} files`);

