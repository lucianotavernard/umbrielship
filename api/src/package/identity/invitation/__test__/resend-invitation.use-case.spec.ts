import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeOrganization, makeUser } from '@test/factory.js';
import { FakeInvitationDeliveryQueue } from '@test/invitation/fake-invitation-delivery-queue.js';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { Invitation } from '../invitation.entity.js';
import { ResendInvitationUseCase } from '../resend-invitation.use-case.js';

let invitations: InMemoryInvitationsRepository;
let queue: FakeInvitationDeliveryQueue;
let sut: ResendInvitationUseCase;

const make = (override: Record<string, unknown>) =>
  Invitation.create(
    {
      userId: 'user-1',
      organizationId: 'dest',
      secret: 's'.repeat(64),
      status: 'pending',
      role: 'operator',
      ...override,
    } as never,
    'inv-1',
  );

describe('ResendInvitationUseCase', () => {
  beforeEach(() => {
    invitations = new InMemoryInvitationsRepository();
    queue = new FakeInvitationDeliveryQueue();
    const users = new InMemoryUsersRepository();
    const organizations = new InMemoryOrganizationsRepository();
    users.items.push(makeUser({ email: 'maria@x.test' }));
    organizations.items.push(makeOrganization({ name: 'Dest' }, 'dest'));
    sut = new ResendInvitationUseCase(invitations, users, organizations, queue);
  });

  it.each(['delivered', 'failed'] as const)(
    '[C53] requeues a pending Invitation whose delivery is %s, keeping its secret',
    async (deliveryStatus) => {
      invitations.items.push(
        make({
          deliveryStatus,
          deliveryAttempts: 3,
          lastDeliveryFailureAt: new Date(),
        }),
      );

      const { invitation } = await sut.handle({ invitationId: 'inv-1' });

      expect(invitation.deliveryStatus).toBe('queued');
      expect(invitations.items[0]).toMatchObject({
        deliveryStatus: 'queued',
        deliveryAttempts: 0,
        lastDeliveryFailureAt: null,
        secret: 's'.repeat(64),
      });
      expect(queue.enqueued).toEqual(['inv-1']);
    },
  );

  it('[C53] throws ConflictDomainException for an accepted Invitation and for one already queued', async () => {
    invitations.items.push(
      make({ status: 'accepted', deliveryStatus: 'delivered' }),
    );
    await expect(sut.handle({ invitationId: 'inv-1' })).rejects.toThrow(
      'Invitation already accepted',
    );

    invitations.items[0].status = 'pending';
    invitations.items[0].deliveryStatus = 'queued';
    const promise = sut.handle({ invitationId: 'inv-1' });
    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Invitation delivery already queued');
    expect(queue.enqueued).toHaveLength(0);
  });

  it('[C53] throws NotFoundDomainException for an unknown id', async () => {
    await expect(
      sut.handle({ invitationId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
  });
});
