import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { GetProfileUseCase } from '../get-profile.use-case';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;
let sut: GetProfileUseCase;

describe('GetProfileUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    sut = new GetProfileUseCase(users, organizations);
    organizations.items.push(
      makeOrganization(
        { name: 'Umbrielship', email: 'i@x.test', isInternal: true },
        'org-1',
      ),
      makeOrganization({ name: 'Atlantic', email: 'a@x.test' }, 'org-2'),
    );
  });

  it('[C16] returns the active Organization, the Role there and every Membership, never the password', async () => {
    users.items.push(
      makeUser({
        activeOrganizationId: 'org-2',
        memberships: [
          { organizationId: 'org-1', role: 'administrator' },
          { organizationId: 'org-2', role: 'operator' },
        ],
      }),
    );

    const { user } = await sut.handle('user-1');

    expect(user).toEqual({
      id: 'user-1',
      name: 'Maria Souza',
      email: 'maria@umbrielship.test',
      role: 'operator',
      organization: { id: 'org-2', name: 'Atlantic', isInternal: false },
      organizations: [
        { id: 'org-2', name: 'Atlantic', isInternal: false, role: 'operator' },
        {
          id: 'org-1',
          name: 'Umbrielship',
          isInternal: true,
          role: 'administrator',
        },
      ],
    });
    expect(user).not.toHaveProperty('password');
  });

  it('[C16] throws NotFoundDomainException for an unknown user', async () => {
    await expect(sut.handle('missing')).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
    await expect(sut.handle('missing')).rejects.toThrow('User not found');
  });

  it('[C16] throws NotFoundDomainException when the active Organization has no Membership', async () => {
    users.items.push(makeUser({ activeOrganizationId: 'org-2' }));

    const promise = sut.handle('user-1');

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
  });
});
