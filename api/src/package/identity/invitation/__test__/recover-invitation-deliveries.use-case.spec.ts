import { beforeEach, describe, expect, it } from 'vitest';
import { FakeInvitationDeliveryQueue } from '@test/invitation/fake-invitation-delivery-queue';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';

import { InvitationDeliveryRecovery } from '../invitation-delivery.recovery';
import {
  Invitation,
  InvitationDeliveryStatus,
  InvitationStatus,
} from '../invitation.entity';
import { RecoverInvitationDeliveriesUseCase } from '../recover-invitation-deliveries.use-case';

let invitationsRepository: InMemoryInvitationsRepository;
let invitationDeliveryQueue: FakeInvitationDeliveryQueue;
let sut: RecoverInvitationDeliveriesUseCase;

function addInvitation(
  deliveryStatus: InvitationDeliveryStatus,
  index: number,
  status: InvitationStatus = 'pending',
) {
  const invitation = Invitation.create({
    userId: `user-${index}`,
    organizationId: 'organization',
    secret: `secret-${index}`,
    status,
    role: 'operator',
    deliveryStatus,
  });
  invitationsRepository.items.push(invitation);
  return invitation;
}

describe('Recover invitation deliveries', () => {
  beforeEach(() => {
    invitationsRepository = new InMemoryInvitationsRepository(
      new InMemoryUsersRepository(),
    );
    invitationDeliveryQueue = new FakeInvitationDeliveryQueue();
    sut = new RecoverInvitationDeliveriesUseCase(
      invitationsRepository,
      invitationDeliveryQueue,
    );
  });

  it('[C57] queues again every invitation still queued', async () => {
    addInvitation('delivered', 0);
    addInvitation('failed', 1);

    expect(await sut.handle()).toEqual({ enqueued: 0 });
    expect(invitationDeliveryQueue.enqueued).toEqual([]);

    const queued = [
      addInvitation('queued', 2),
      addInvitation('queued', 3),
      addInvitation('queued', 4),
    ];
    addInvitation('delivered', 5);

    expect(await sut.handle()).toEqual({ enqueued: 3 });
    expect(invitationDeliveryQueue.enqueued.sort()).toEqual(
      queued.map(({ id }) => id).sort(),
    );
  });

  it('[C57] skips an accepted invitation that still reads queued', async () => {
    const pending = [addInvitation('queued', 0), addInvitation('queued', 1)];
    addInvitation('queued', 2, 'accepted');

    expect(await sut.handle()).toEqual({ enqueued: 2 });
    expect(invitationDeliveryQueue.enqueued.sort()).toEqual(
      pending.map(({ id }) => id).sort(),
    );
  });

  it('[C57] keeps going when one enqueue throws', async () => {
    addInvitation('queued', 0);
    addInvitation('queued', 1);
    let calls = 0;
    const enqueue = invitationDeliveryQueue.enqueue.bind(
      invitationDeliveryQueue,
    );
    invitationDeliveryQueue.enqueue = async (id: string) => {
      if (calls++ === 0) throw new Error('redis down');
      return enqueue(id);
    };

    expect(await sut.handle()).toEqual({ enqueued: 1 });
  });

  it('[C57] InvitationDeliveryRecovery runs the use case at boot', async () => {
    addInvitation('queued', 0);

    await new InvitationDeliveryRecovery(sut).onApplicationBootstrap();

    expect(invitationDeliveryQueue.enqueued).toHaveLength(1);
  });
});
