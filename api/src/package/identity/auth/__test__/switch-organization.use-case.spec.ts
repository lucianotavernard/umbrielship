import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { ResolveSessionUseCase } from '../resolve-session.use-case';
import { SwitchOrganizationUseCase } from '../switch-organization.use-case';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;
let sut: SwitchOrganizationUseCase;

describe('SwitchOrganizationUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    sut = new SwitchOrganizationUseCase(users);
    organizations.items.push(
      makeOrganization({ name: 'One', email: '1@x.test' }, 'org-1'),
      makeOrganization({ name: 'Two', email: '2@x.test' }, 'org-2'),
      makeOrganization({ name: 'Three', email: '3@x.test' }, 'org-3'),
    );
    users.items.push(
      makeUser({
        memberships: [
          { organizationId: 'org-1', role: 'operator' },
          { organizationId: 'org-2', role: 'administrator' },
        ],
      }),
    );
  });

  it('[C48] moves the active Organization so the next session resolves to it', async () => {
    await sut.handle({ userId: 'user-1', organizationId: 'org-2' });

    const session = await new ResolveSessionUseCase(
      users,
      organizations,
    ).handle({
      userId: 'user-1',
    });

    expect(session.organizationId).toBe('org-2');
    expect(session.role).toBe('administrator');
  });

  it('[C48] answers not found for an Organization the User is not a member of, existing or not', async () => {
    for (const organizationId of ['org-3', 'missing']) {
      const promise = sut.handle({ userId: 'user-1', organizationId });

      await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
      await expect(promise).rejects.toThrow('Organization not found');
    }
    expect((await users.findById('user-1'))?.activeOrganizationId).toBe(
      'org-1',
    );
  });
});
