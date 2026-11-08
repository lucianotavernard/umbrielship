import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const srcRoot = join(import.meta.dirname, '..', 'src');
const packageRoot = join(srcRoot, 'package');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (name === 'generated' || name === 'node_modules') return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? [path, ...walk(path)] : [path];
  });

const all = walk(packageRoot);
const files = all.filter((path) => statSync(path).isFile());
const dirs = all.filter((path) => statSync(path).isDirectory());
const rel = (path: string) => relative(srcRoot, path);

const aggregates = [
  'customer/customer',
  'customer/vessel',
  'work-order/work-order',
  'work-order/work-order-service',
  'work-order/work-order-service-image',
  'identity/auth',
  'identity/user',
  'identity/organization',
  'identity/invitation',
];

const read = (path: string) => readFileSync(path, 'utf8');

describe('acme layout', () => {
  it('[C30] has every aggregate folder with a __test__ folder and a contracts folder where it has a repository', () => {
    for (const aggregate of aggregates) {
      const dir = join(packageRoot, aggregate);
      expect(existsSync(dir), `${aggregate} exists`).toBe(true);
      expect(existsSync(join(dir, '__test__')), `${aggregate}/__test__`).toBe(
        true,
      );

      const hasRepository = readdirSync(dir).some((name) =>
        name.endsWith('.repository.ts'),
      );
      if (hasRepository) {
        expect(
          existsSync(join(dir, 'contracts')),
          `${aggregate}/contracts`,
        ).toBe(true);
      }
    }
    expect(existsSync(join(packageRoot, 'shared'))).toBe(true);
  });

  it('[C30] has no core, http or persistence folder and one class per use case file', () => {
    const forbidden = dirs.filter((dir) =>
      ['core', 'http', 'persistence'].includes(dir.split('/').pop()!),
    );
    const outsideShared = forbidden.filter(
      (dir) => !dir.includes('/shared/lib/http'),
    );
    expect(outsideShared.map(rel)).toEqual([]);

    for (const file of files.filter((path) => path.endsWith('.use-case.ts'))) {
      const classes = read(file).match(/^export class \w+/gm) ?? [];
      expect(classes, rel(file)).toHaveLength(1);
    }
  });

  it('[C31] has no Entity suffix and one I<Plural>Repository per repository contract', () => {
    for (const file of files.filter(
      (path) => path.endsWith('.ts') && !path.includes('/__test__/'),
    )) {
      expect(read(file), rel(file)).not.toMatch(
        /export (?:abstract )?class \w+Entity\b/,
      );
    }

    const expected = [
      'ICustomersRepository',
      'IVesselsRepository',
      'IWorkOrdersRepository',
      'IWorkOrderServicesRepository',
      'IWorkOrderServiceImagesRepository',
      'IUsersRepository',
      'IOrganizationsRepository',
      'IInvitationsRepository',
    ];
    const contracts = files.filter((path) =>
      path.endsWith('-repository.contract.ts'),
    );
    const declared = contracts.flatMap((file) =>
      [...read(file).matchAll(/export abstract class (\w+)/g)].map(
        (match) => match[1],
      ),
    );

    expect(declared.sort()).toEqual([...expected].sort());
    expect(dirs.filter((dir) => dir.endsWith('/core/interface'))).toEqual([]);
  });

  it('[C32] exposes the routes of today, /me and the identity routes, one controller class per file', () => {
    const controllers = files.filter((path) => path.endsWith('.controller.ts'));
    const routes: string[] = [];

    for (const file of controllers) {
      const source = read(file);
      expect(source.match(/@Controller\(/g) ?? [], rel(file)).toHaveLength(1);

      const prefix = source.match(/@Controller\((?:'([^']*)')?\)/)![1] ?? '';
      for (const match of source.matchAll(
        /@(Get|Post|Put|Delete|Patch)\((?:'([^']*)')?\)/g,
      )) {
        const path = [prefix, match[2] ?? '']
          .map((part) => part.replace(/^\/|\/$/g, ''))
          .filter(Boolean)
          .join('/');
        routes.push(`${match[1].toUpperCase()} /${path}`);
      }
    }

    expect(routes.sort()).toEqual(
      [
        'GET /customers',
        'GET /customers/:id',
        'POST /customers',
        'PUT /customers/:id',
        'GET /vessels',
        'GET /vessels/:id',
        'POST /vessels',
        'PUT /customers/:customerId/vessels/:id',
        'DELETE /vessels/:id',
        'GET /work-orders',
        'GET /work-orders/:id',
        'POST /work-orders',
        'PUT /work-orders/:id',
        'DELETE /work-orders/:id',
        'GET /work-orders/:workOrderId/services',
        'GET /work-orders/:workOrderId/services/:id',
        'POST /work-orders/:workOrderId/services',
        'PUT /work-orders/:workOrderId/services/:id',
        'DELETE /work-orders/:workOrderId/services/:id',
        'GET /work-orders/:workOrderId/services/:serviceId/images',
        'POST /work-orders/:workOrderId/services/:serviceId/images',
        'DELETE /work-orders/:workOrderId/services/:serviceId/images/:id',
        'POST /sessions',
        'GET /me',
        'POST /organizations/switch',
        'GET /organizations',
        'POST /organizations',
        'GET /organizations/:id',
        'GET /organizations/:id/users',
        'GET /organizations/:id/roles',
        'GET /organizations/:id/invitations',
        'GET /users',
        'POST /users',
        'POST /invitations',
        'POST /invitations/:id/resend',
        'POST /invitations/accept',
      ].sort((a, b) => a.localeCompare(b)),
    );

    const names = controllers.map((file) => file.split('/').pop());
    expect(
      [...names].sort((a, b) => String(a).localeCompare(String(b))),
    ).toEqual(
      [
        'customer.controller.ts',
        'vessel.controller.ts',
        'work-order.controller.ts',
        'work-order-service.controller.ts',
        'work-order-service-image.controller.ts',
        'authentication.controller.ts',
        'organization.controller.ts',
        'user.controller.ts',
        'invitation.controller.ts',
      ].sort((a, b) => a.localeCompare(b)),
    );
  });

  it('[C34] ends every controller catch with a rethrow and maps no error to 400 or 500 by hand', () => {
    for (const file of files.filter((path) =>
      path.endsWith('.controller.ts'),
    )) {
      const source = read(file);

      expect(source, rel(file)).not.toContain('BadRequestException(error');
      expect(source, rel(file)).not.toContain('InternalServerErrorException');

      for (const block of source.split('} catch (error) {').slice(1)) {
        const body = block.split(/\n {4}\}\n/)[0];
        expect(
          body.trimEnd().endsWith('throw error;'),
          `${rel(file)} catch ends with throw error`,
        ).toBe(true);
      }
    }
  });

  it('[C41] keeps work-order away from customer internals; CustomerModule exports only CustomerFacade', () => {
    const allowed = ['customer.module.js', 'customer.facade.js'];

    for (const file of files.filter(
      (path) =>
        path.includes('/package/work-order/') &&
        path.endsWith('.ts') &&
        !path.includes('/__test__/'),
    )) {
      for (const match of read(file).matchAll(
        /from '([^']*package\/customer[^']*|\.\.\/customer[^']*)'/g,
      )) {
        expect(
          allowed.some((name) => match[1].endsWith(name)),
          `${rel(file)} imports ${match[1]}`,
        ).toBe(true);
      }
    }

    expect(read(join(packageRoot, 'customer/customer.module.ts'))).toMatch(
      /exports: \[CustomerFacade\]/,
    );
  });

  it('[C32] opts only POST /sessions and POST /invitations/accept out of the global guard', () => {
    const publics: string[] = [];

    for (const file of files.filter((path) =>
      path.endsWith('.controller.ts'),
    )) {
      for (const match of read(file).matchAll(
        /@Public\(\)\s+@(Get|Post|Put|Delete)\((?:'([^']*)')?\)/g,
      )) {
        publics.push(`${match[1].toUpperCase()} ${match[2] ?? ''}`);
      }
    }

    expect(publics.sort((a, b) => a.localeCompare(b))).toEqual([
      'POST /accept',
      'POST /sessions',
    ]);
  });
});
