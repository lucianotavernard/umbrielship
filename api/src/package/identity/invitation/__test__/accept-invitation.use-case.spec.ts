import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { AcceptInvitationUseCase } from '../accept-invitation.use-case';
import { Invitation } from '../invitation.entity';

let users: InMemoryUsersRepository;
let invitations: InMemoryInvitationsRepository;
let sut: AcceptInvitationUseCase;

describe('AcceptInvitationUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    invitations = new InMemoryInvitationsRepository(users);
    const organizations = new InMemoryOrganizationsRepository();
    organizations.items.push(
      makeOrganization({ name: 'Dest', email: 'd@x.test' }, 'dest'),
    );
    users.items.push(
      makeUser({
        activeOrganizationId: 'org-1',
        memberships: [{ organizationId: 'org-1', role: 'operator' }],
      }),
    );
    invitations.items.push(
      Invitation.create(
        {
          userId: 'user-1',
          organizationId: 'dest',
          secret: 'secret-1',
          status: 'pending',
          role: 'administrator',
        },
        'inv-1',
      ),
    );
    sut = new AcceptInvitationUseCase(invitations, organizations);
  });

  it('[C54] adds the Membership with the invited Role, marks it accepted and keeps the earlier Memberships and active Organization', async () => {
    const result = await sut.handle({ secret: 'secret-1' });

    expect(result).toEqual({ organizationName: 'Dest' });
    expect(invitations.items[0].status).toBe('accepted');
    expect(users.items[0].memberships).toEqual([
      { organizationId: 'org-1', role: 'operator' },
      { organizationId: 'dest', role: 'administrator' },
    ]);
    expect(users.items[0].activeOrganizationId).toBe('org-1');
  });

  it('[C54] throws NotFoundDomainException for an unknown secret', async () => {
    const promise = sut.handle({ secret: 'nope' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Invitation not found');
  });

  it('[C54] throws ConflictDomainException on a second accept and adds no second Membership', async () => {
    await sut.handle({ secret: 'secret-1' });
    const accept = vi.spyOn(invitations, 'accept');

    const promise = sut.handle({ secret: 'secret-1' });

    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Invitation already accepted');
    expect(accept).not.toHaveBeenCalled();
    expect(users.items[0].memberships).toHaveLength(2);
  });
});
