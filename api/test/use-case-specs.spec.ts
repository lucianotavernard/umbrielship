import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const srcRoot = join(import.meta.dirname, '../src');

function find(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return find(path, suffix);
    return path.endsWith(suffix) ? [path] : [];
  });
}

const specOf = (useCase: string) =>
  join(
    dirname(useCase),
    '__test__',
    basename(useCase).replace(/\.ts$/, '.spec.ts'),
  );

const useCases = find(srcRoot, '.use-case.ts');

// The 24 use cases that existed when the unit tier was created (S1).
const S1_USE_CASES = {
  customer: [
    'customer/create-customer',
    'customer/edit-customer',
    'customer/fetch-customers',
    'customer/get-customer-by-id',
    'vessel/create-vessel',
    'vessel/delete-vessel',
    'vessel/edit-vessel',
    'vessel/fetch-vessels',
    'vessel/get-vessel-by-id',
  ],
  identity: ['auth/authenticate-user', 'auth/get-profile'],
  'work-order': [
    'work-order/create-work-order',
    'work-order/delete-work-order',
    'work-order/edit-work-order',
    'work-order/fetch-work-orders',
    'work-order/get-work-order-by-id',
    'work-order-service/create-work-order-service',
    'work-order-service/delete-work-order-service',
    'work-order-service/edit-work-order-service',
    'work-order-service/fetch-work-order-services',
    'work-order-service/get-work-order-service-by-id',
    'work-order-service-image/add-work-order-service-image',
    'work-order-service-image/fetch-work-order-service-images',
    'work-order-service-image/remove-work-order-service-image',
  ],
} as const;

describe('use case specs', () => {
  it('[C1] every one of the 24 use cases has a spec in its __test__ folder with a tagged test', () => {
    const expected = Object.entries(S1_USE_CASES).flatMap(([context, names]) =>
      names.map((name) => `package/${context}/${name}.use-case.ts`),
    );

    expect(expected).toHaveLength(24);
    expect(Object.values(S1_USE_CASES).map((names) => names.length)).toEqual([
      9, 2, 13,
    ]);

    const present = useCases.map((file) => relative(srcRoot, file));
    expect(expected.filter((file) => !present.includes(file))).toEqual([]);

    const specs = expected.map((file) => specOf(join(srcRoot, file)));
    const missing = specs.filter((spec) => !existsSync(spec));
    expect(missing.map((file) => relative(srcRoot, file))).toEqual([]);

    const empty = specs.filter(
      (spec) => !/^\s*it\(\s*['"`]\[C\d+\]/m.test(readFileSync(spec, 'utf8')),
    );
    expect(empty.map((file) => relative(srcRoot, file))).toEqual([]);
  });

  it('every use case, old or new, has a spec in its __test__ folder', () => {
    const missing = useCases.filter((file) => !existsSync(specOf(file)));

    expect(missing.map((file) => relative(srcRoot, file))).toEqual([]);
  });
});
