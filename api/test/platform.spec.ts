import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const apiRoot = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(path, 'utf8');
const pkg = JSON.parse(read(join(apiRoot, 'package.json')));
const tsconfig = JSON.parse(read(join(apiRoot, 'tsconfig.json')));

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (name === 'generated' || name === 'node_modules') return [];
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? sources(path)
      : path.endsWith('.ts')
        ? [path]
        : [];
  });

const files = [
  ...sources(join(apiRoot, 'src')),
  ...sources(join(apiRoot, 'test')),
];

describe('api platform', () => {
  it('[C66] is an ES module on NestJS 12 and TypeScript 6, without tsc-alias or ts-loader', () => {
    expect(pkg.type).toBe('module');

    const declared = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@nestjs/jwt',
      '@nestjs/passport',
      '@nestjs/bullmq',
      '@nestjs/config',
      '@nestjs/testing',
      '@nestjs/cli',
      '@nestjs/schematics',
    ]) {
      expect(declared[name], name).toMatch(/^\^12\./);
    }
    expect(declared.typescript).toMatch(/^\^6\./);
    expect(declared['tsc-alias']).toBeUndefined();
    expect(declared['ts-loader']).toBeUndefined();

    expect(pkg.scripts.build).toBe('nest build');
    expect(pkg.scripts['start:prod']).toBe('node dist/main');
  });

  it('[C67] turns TypeScript strict on in every config the build reads, and no strict flag back off, apart from property initialization', () => {
    const buildConfig = JSON.parse(read(join(apiRoot, 'tsconfig.build.json')));

    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(buildConfig.extends).toBe('./tsconfig.json');

    for (const options of [
      tsconfig.compilerOptions,
      buildConfig.compilerOptions,
    ]) {
      for (const flag of [
        'strict',
        'strictNullChecks',
        'noImplicitAny',
        'strictBindCallApply',
        'strictFunctionTypes',
        'noImplicitThis',
        'alwaysStrict',
        'useUnknownInCatchVariables',
      ]) {
        expect(options[flag], flag).not.toBe(false);
      }
    }
  });

  it('[C68] uses .js specifiers for project files and no CommonJS in src and test', () => {
    // The quoted string after `from`, `import`, `import(` or a vi helper.
    const specifier =
      /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+|\bvi\.(?:mock|doMock|importActual|importMock)\(\s*)['"](\.{1,2}|\.{1,2}\/[^'"]*|@\/[^'"]*|@test\/[^'"]*)['"]/g;

    for (const file of files) {
      const code = read(file);
      const name = relative(apiRoot, file);

      for (const match of code.matchAll(specifier)) {
        expect(match[1], `${name} imports ${match[1]}`).toMatch(/\.(js|json)$/);
      }
      if (name !== 'test/platform.spec.ts') {
        expect(code, name).not.toMatch(
          /\brequire\(|module\.exports|__dirname|__filename/,
        );
      }
    }

    expect(
      read(join(apiRoot, 'src/package/shared/module/prisma/schema.prisma')),
    ).toMatch(/moduleFormat\s*=\s*"esm"/);
    expect(
      read(
        join(
          apiRoot,
          'src/package/shared/module/prisma/generated/prisma/client.ts',
        ),
      ),
    ).not.toMatch(/\brequire\(/);
    expect(tsconfig.compilerOptions.module).toBe('nodenext');
  });
});
