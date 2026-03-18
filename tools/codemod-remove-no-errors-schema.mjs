import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';

const root = process.cwd();
const files = globSync('src/app/**/*.ts', { cwd: root, nodir: true, absolute: true });

function stripSchemas(src) {
  // Remove schemas property lines added by our codemod
  src = src.replace(/^\s*schemas:\s*\[NO_ERRORS_SCHEMA\],\s*\r?\n/gm, '');
  return src;
}

function stripImport(src) {
  // Remove NO_ERRORS_SCHEMA from @angular/core import lists.
  const rx = /import\s*\{([^}]+)\}\s*from\s*['"]@angular\/core['"];?/gm;
  return src.replace(rx, (full, inside) => {
    if (!inside.includes('NO_ERRORS_SCHEMA')) return full;
    const parts = inside.split(',').map((s) => s.trim()).filter(Boolean);
    const filtered = parts.filter((p) => p !== 'NO_ERRORS_SCHEMA');
    if (filtered.length === 0) {
      // Remove entire import if it only imported NO_ERRORS_SCHEMA
      return '';
    }
    return `import { ${filtered.join(', ')} } from '@angular/core';`;
  });
}

let changed = 0;
for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let next = original;
  next = stripSchemas(next);
  next = stripImport(next);
  if (next !== original) {
    writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(`codemod-remove-no-errors-schema: updated ${changed} files`);

