import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';
import path from 'node:path';

// Adds `standalone: false` to @Component/@Directive/@Pipe decorators that don't specify standalone.
// This is needed because Angular 21 treats declarations as standalone by default.

const root = process.cwd();
const patterns = [
  'src/app/**/*.ts',
];

const files = patterns.flatMap((p) => globSync(p, { cwd: root, nodir: true, absolute: true }));

function patchDecorator(source, decoratorName) {
  // match: @Component({ ... })
  // We only operate on object-literal form.
  const rx = new RegExp(`@${decoratorName}\\s*\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)`, 'g');
  return source.replace(rx, (full, body) => {
    if (/\bstandalone\s*:/.test(body)) return full;

    // Insert standalone:false after the opening brace, preserving indentation.
    // Try to detect indentation from first property line.
    const lines = body.split('\n');
    const firstPropLine = lines.find((l) => l.trim().length > 0);
    const indentMatch = firstPropLine ? firstPropLine.match(/^(\s*)/) : null;
    const indent = indentMatch ? indentMatch[1] : '  ';

    const insertion = `\n${indent}standalone: false,`;

    // If body starts with newline already, keep it.
    const newBody = body.startsWith('\n')
      ? body.replace(/^\n/, `\n${indent}standalone: false,\n`)
      : `${insertion}\n${body}`;

    return `@${decoratorName}({${newBody}})`;
  });
}

let changed = 0;
for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let next = original;
  next = patchDecorator(next, 'Component');
  next = patchDecorator(next, 'Directive');
  next = patchDecorator(next, 'Pipe');

  if (next !== original) {
    writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(`codemod-standalone-false: updated ${changed} files`);

