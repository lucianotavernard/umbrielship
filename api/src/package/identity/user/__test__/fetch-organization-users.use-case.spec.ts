import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeOrganization, makeUser } from '@test/factory.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { FetchOrganizationUsersUseCase } from '../fetch-organization-users.use-case.js';

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

describe('FetchOrganizationUsersUseCase', () => {
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

  it('[C60] FetchOrganizationUsersUseCase returns the members with their Role, paged, and the total', async () => {
    const sut = new FetchOrganizationUsersUseCase(users, organizations);

    const result = await sut.handle({
      organizationId: 'o1',
      page: 1,
      perPage: 2,
    });

    expect(result.users).toEqual([
      {
        id: 'u1',
        name: 'Maria Souza',
        email: 'u1@x.test',
        role: 'administrator',
      },
      { id: 'u2', name: 'Maria Souza', email: 'u2@x.test', role: 'operator' },
    ]);
    expect(result.total).toBe(3);
  });

  it('[C60] throws NotFoundDomainException for an unknown Organization', async () => {
    const promise = new FetchOrganizationUsersUseCase(
      users,
      organizations,
    ).handle({
      organizationId: 'missing',
      page: 1,
      perPage: 10,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
  });
});
