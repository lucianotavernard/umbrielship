import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { CountOrganizationRolesUseCase } from '../count-organization-roles.use-case';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;

const member = (
  id: string,
  role: 'administrator' | 'operator',
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
    ]);

    organizations.items.push(
      makeOrganization({ name: 'Empty', email: 'e@x.test' }, 'o3'),
    );
    expect((await sut.handle({ organizationId: 'o3' })).roles).toEqual([
      { role: 'administrator', users: 0 },
      { role: 'operator', users: 0 },
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
});
