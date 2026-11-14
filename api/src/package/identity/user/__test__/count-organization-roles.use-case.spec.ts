import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeOrganization, makeUser } from '@test/factory.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { CountOrganizationRolesUseCase } from '../count-organization-roles.use-case.js';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;

const member = (
  id: string,
  role: 'administrator' | 'operator' | 'inspector',
  organizationId = 'o1',
) => {
  const user = makeUser({
    email: `${id}@x.test`,
    memberships: [{ organizationId, role }],
  });
  user.id = id;
  return user;
};

describe('CountOrganizationRolesUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    organizations.items.push(makeOrganization({}, 'o1'));
    users.items.push(
      member('u1', 'administrator'),
      member('u2', 'operator'),
      member('u3', 'operator'),
      member('u4', 'operator', 'o2'),
    );
  });

  it('[C60] CountOrganizationRolesUseCase lists every Role in order, with 0 for a Role nobody holds', async () => {
    const sut = new CountOrganizationRolesUseCase(users, organizations);

    expect((await sut.handle({ organizationId: 'o1' })).roles).toEqual([
      { role: 'administrator', users: 1 },
      { role: 'operator', users: 2 },
      { role: 'inspector', users: 0 },
    ]);

    organizations.items.push(
      makeOrganization({ name: 'Empty', email: 'e@x.test' }, 'o3'),
    );
    expect((await sut.handle({ organizationId: 'o3' })).roles).toEqual([
      { role: 'administrator', users: 0 },
      { role: 'operator', users: 0 },
      { role: 'inspector', users: 0 },
    ]);
  });

  it('[C60] throws NotFoundDomainException for an unknown Organization', async () => {
    const promise = new CountOrganizationRolesUseCase(
      users,
      organizations,
    ).handle({
      organizationId: 'missing',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
  });

  it('inspector C6 lists administrator, operator and inspector in that order with zero inspectors', async () => {
    const sut = new CountOrganizationRolesUseCase(users, organizations);

    expect((await sut.handle({ organizationId: 'o1' })).roles).toEqual([
      { role: 'administrator', users: 1 },
      { role: 'operator', users: 2 },
      { role: 'inspector', users: 0 },
    ]);

    users.items.push(
      member('u5', 'inspector'),
      member('u6', 'inspector', 'o2'),
    );

    expect((await sut.handle({ organizationId: 'o1' })).roles).toEqual([
      { role: 'administrator', users: 1 },
      { role: 'operator', users: 2 },
      { role: 'inspector', users: 1 },
    ]);
  });
});
