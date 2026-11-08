import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const srcRoot = join(__dirname, '../src');

function find(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return find(path, suffix);
    return path.endsWith(suffix) ? [path] : [];
  });
}

describe('use case specs', () => {
  it('[C1] every one of the 24 use cases has a sibling spec', () => {
    const useCases = find(srcRoot, '.use-case.ts');
    const counts = (context: string) =>
      useCases.filter((file) =>
        relative(srcRoot, file).startsWith(`${context}/`),
      ).length;

    expect(useCases).toHaveLength(24);
    expect([
      counts('customer'),
      counts('identity'),
      counts('work-order'),
    ]).toEqual([9, 2, 13]);

    const missing = useCases.filter((file) => {
      const spec = file.replace(/\.ts$/, '.spec.ts');
      const nested = join(dirname(file), '__test__', spec.split('/').pop()!);
      return !existsSync(spec) && !existsSync(nested);
    });

    expect(missing.map((file) => relative(srcRoot, file))).toEqual([]);

    const empty = useCases.filter((file) => {
      const spec = file.replace(/\.ts$/, '.spec.ts');
      const path = existsSync(spec)
        ? spec
        : join(dirname(file), '__test__', spec.split('/').pop()!);
      return !/^\s*it\(\s*['"`]\[C\d+\]/m.test(readFileSync(path, 'utf8'));
    });

    expect(empty.map((file) => relative(srcRoot, file))).toEqual([]);
  });
});
