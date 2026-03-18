import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';

const root = process.cwd();
const files = globSync('src/app/**/*.ts', { cwd: root, nodir: true, absolute: true });

function ensureImport(src) {
  if (src.includes('NO_ERRORS_SCHEMA')) return src;
  // Add to existing @angular/core import if present.
  const coreImportRx = /import\s*\{([^}]+)\}\s*from\s*['"]@angular\/core['"];?/m;
  const m = src.match(coreImportRx);
  if (m) {
    const inside = m[1];
    const parts = inside.split(',').map((s) => s.trim()).filter(Boolean);
    parts.push('NO_ERRORS_SCHEMA');
    const uniq = [...new Set(parts)];
    return src.replace(coreImportRx, `import { ${uniq.join(', ')} } from '@angular/core';`);
  }
  // Otherwise prepend a new import (rare).
  return `import { NO_ERRORS_SCHEMA } from '@angular/core';\n${src}`;
}

function patchComponentDecorator(src) {
  const rx = /@Component\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  return src.replace(rx, (full, body) => {
    if (/\bschemas\s*:/.test(body)) return full;
    // Insert schemas near top.
    const lines = body.split('\n');
    const firstPropLine = lines.find((l) => l.trim().length > 0);
    const indent = firstPropLine?.match(/^(\s*)/)?.[1] ?? '  ';
    const insertion = `${indent}schemas: [NO_ERRORS_SCHEMA],\n`;
    const newBody = body.startsWith('\n') ? body.replace(/^\n/, `\n${insertion}`) : `\n${insertion}${body}`;
    return `@Component({${newBody}})`;
  });
}

let changed = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  if (!src.includes('@Component')) continue;
  const original = src;
  src = patchComponentDecorator(src);
  if (src !== original) {
    src = ensureImport(src);
    writeFileSync(file, src, 'utf8');
    changed++;
  }
}

console.log(`codemod-add-no-errors-schema: updated ${changed} files`);

