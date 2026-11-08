// Checks what `npm run build` wrote under dist/: an ES module entry point, no path alias left
// over, and the generated Prisma client as ES modules. Run from api/ after the build.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', '..', 'dist');
const failures = [];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const main = join(dist, 'main.js');
if (!existsSync(main)) {
  failures.push('dist/main.js is missing');
} else if (!/^import\s/m.test(readFileSync(main, 'utf8'))) {
  failures.push('dist/main.js is not an ES module');
}

const client = join(
  dist,
  'package/shared/module/prisma/generated/prisma/client.js',
);
if (!existsSync(client)) {
  failures.push('the generated Prisma client is not under dist/');
} else if (/\brequire\(|module\.exports/.test(readFileSync(client, 'utf8'))) {
  failures.push('the generated Prisma client is CommonJS');
}

for (const file of walk(dist).filter((path) => path.endsWith('.js'))) {
  if (/(?:from\s+|import\s*\(\s*)['"]@\//.test(readFileSync(file, 'utf8'))) {
    failures.push(`${file} still imports through the @/ alias`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('dist: ES modules, no @/ alias left');
