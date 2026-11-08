import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const apiRoot = join(__dirname, '..');

describe('test tooling', () => {
  it('[C3] has no Jest e2e scaffold and keeps the 6 in-memory repositories in test/repositories', () => {
    expect(existsSync(join(apiRoot, 'test/app.e2e-spec.ts'))).toBe(false);
    expect(existsSync(join(apiRoot, 'test/jest-e2e.json'))).toBe(false);

    for (const file of [
      'in-memory-customers-repository.ts',
      'in-memory-vessels-repository.ts',
      'in-memory-users-repository.ts',
      'in-memory-work-orders-repository.ts',
      'in-memory-work-order-services-repository.ts',
      'in-memory-work-order-service-images-repository.ts',
    ]) {
      expect(existsSync(join(apiRoot, 'test/repositories', file)), file).toBe(
        true,
      );
    }
  });

  it('[C4] swaps Jest and ESLint for Vitest and oxlint in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(apiRoot, 'package.json'), 'utf8'));
    const declared = Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    });

    expect(declared).toContain('vitest');
    expect(declared).toContain('oxlint');
    for (const gone of ['jest', 'ts-jest', 'eslint', 'typescript-eslint']) {
      expect(declared, gone).not.toContain(gone);
    }
    expect(pkg.jest).toBeUndefined();
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts.lint).toMatch(/^oxlint\b/);
    expect(existsSync(join(apiRoot, 'eslint.config.mjs'))).toBe(false);
  });
});
