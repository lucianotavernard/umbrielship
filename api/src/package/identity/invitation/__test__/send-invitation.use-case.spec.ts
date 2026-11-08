import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeOrganization, makeUser } from '@test/factory';
import { FakeInvitationDeliveryQueue } from '@test/invitation/fake-invitation-delivery-queue';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { SendInvitationUseCase } from '../send-invitation.use-case';

let invitations: InMemoryInvitationsRepository;
let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;
let queue: FakeInvitationDeliveryQueue;
let sut: SendInvitationUseCase;

const input = {
  userId: 'user-1',
  organizationId: 'dest',
  role: 'operator' as const,
};

describe('SendInvitationUseCase', () => {
  beforeEach(() => {
    invitations = new InMemoryInvitationsRepository();
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    queue = new FakeInvitationDeliveryQueue();
    sut = new SendInvitationUseCase(invitations, users, organizations, queue);
    users.items.push(makeUser({ email: 'maria@x.test' }));
    organizations.items.push(
      makeOrganization({ name: 'Dest', email: 'd@x.test' }, 'dest'),
      makeOrganization(
        { name: 'Umbrielship', email: 'u@x.test', isInternal: true },
        'internal',
      ),
    );
  });

  it('[C52] stores a pending queued Invitation with a unique 64-hex secret, enqueues it once and hides the secret', async () => {
    const { invitation } = await sut.handle(input);

    expect(invitation).toEqual({
      id: expect.any(String),
      email: 'maria@x.test',
      organizationName: 'Dest',
      role: 'operator',
      status: 'pending',
      deliveryStatus: 'queued',
    });
    expect(invitation).not.toHaveProperty('secret');
    const stored = invitations.items[0];
    expect(stored.secret).toMatch(/^[0-9a-f]{64}$/);
    expect(queue.enqueued).toEqual([invitation.id]);

    invitations.items = [];
    users.items[0].memberships = [];
    await sut.handle(input);
    expect(invitations.items[0].secret).not.toBe(stored.secret);
  });

  it('[C52] throws ConflictDomainException for a User already in the Organization, the internal Organization and a pending Invitation', async () => {
    users.items[0].memberships = [{ organizationId: 'dest', role: 'operator' }];
    await expect(sut.handle(input)).rejects.toBeInstanceOf(
      ConflictDomainException,
    );

    users.items[0].memberships = [];
    await expect(
      sut.handle({ ...input, organizationId: 'internal' }),
    ).rejects.toBeInstanceOf(ConflictDomainException);

    await sut.handle(input);
    await expect(sut.handle(input)).rejects.toThrow(
      'Invitation already pending',
    );
    expect(invitations.items).toHaveLength(1);
    expect(queue.enqueued).toHaveLength(1);
  });

  it('[C52] throws NotFoundDomainException for an unknown User or Organization and stores and enqueues nothing', async () => {
    await expect(
      sut.handle({ ...input, userId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(
      sut.handle({ ...input, organizationId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    expect(invitations.items).toHaveLength(0);
    expect(queue.enqueued).toHaveLength(0);
  });

  it('[C52] keeps the Invitation queued and still answers when the queue throws', async () => {
    queue.failure = new Error('redis down');

    const { invitation } = await sut.handle(input);

    expect(invitation.deliveryStatus).toBe('queued');
    expect(invitations.items).toHaveLength(1);
    expect(invitations.items[0].deliveryStatus).toBe('queued');
  });
});
