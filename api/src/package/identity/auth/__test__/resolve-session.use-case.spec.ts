import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { ResolveSessionUseCase } from '../resolve-session.use-case';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;
let sut: ResolveSessionUseCase;

describe('ResolveSessionUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    sut = new ResolveSessionUseCase(users, organizations);
    organizations.items.push(
      makeOrganization(
        { name: 'Umbrielship', email: 'i@x.test', isInternal: true },
        'org-1',
      ),
    );
  });

  it('[C47] returns the active Organization, the Role there and whether it is internal', async () => {
    users.items.push(
      makeUser({
        memberships: [{ organizationId: 'org-1', role: 'administrator' }],
      }),
    );

    expect(await sut.handle({ userId: 'user-1' })).toEqual({
      sub: 'user-1',
      organizationId: 'org-1',
      role: 'administrator',
      internal: true,
    });
  });

  it('[C47] throws NotFoundDomainException for an unknown user', async () => {
    await expect(sut.handle({ userId: 'missing' })).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
  });

  it('[C47] throws NotFoundDomainException when the active Organization has no Membership', async () => {
    users.items.push(makeUser({ memberships: [] }));

    await expect(sut.handle({ userId: 'user-1' })).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
  });
});
