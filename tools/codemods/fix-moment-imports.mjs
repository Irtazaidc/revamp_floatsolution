import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());
const srcRoot = path.join(projectRoot, 'src');

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
      yield* walk(full);
    } else if (ent.isFile() && full.endsWith('.ts')) {
      yield full;
    }
  }
}

function fixMomentImports(text) {
  let out = text;
  out = out.replaceAll("import * as moment from 'moment';", "import moment from 'moment';");
  out = out.replaceAll('import * as moment from "moment";', 'import moment from "moment";');
  return out;
}

let changed = 0;
let scanned = 0;

try {
  await fs.access(srcRoot);
} catch {
  console.error(`Cannot find src folder at ${srcRoot}`);
  process.exit(1);
}

for await (const file of walk(srcRoot)) {
  scanned++;
  const before = await fs.readFile(file, 'utf8');
  const after = fixMomentImports(before);
  if (after !== before) {
    await fs.writeFile(file, after, 'utf8');
    changed++;
  }
}

console.log(`Scanned ${scanned} .ts files`);
console.log(`Updated ${changed} files (moment import style)`);

