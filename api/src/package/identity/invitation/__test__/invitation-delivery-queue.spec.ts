import { describe, expect, it, vi } from 'vitest';
import { Job, Queue } from 'bullmq';

import {
  DeliverInvitationOutcome,
  DeliverInvitationUseCase,
} from '../deliver-invitation.use-case';
import { InvitationDeliveryQueueConsumer } from '../invitation-delivery.queue-consumer';

import { InvitationDeliveryQueueProducer } from '../invitation-delivery.queue-producer';
import {
  invitationDeliveryBackoff,
  invitationDeliveryJobOptions,
} from '../invitation-delivery.queue';

describe('Invitation delivery queue', () => {
  it('[C56] retries after 5 seconds and then 10 seconds, three attempts in all', () => {
    const options = invitationDeliveryJobOptions('invitation-1');

    expect(options.attempts).toBe(3);
    expect(options.backoff).toEqual({ type: 'custom' });
    // BullMQ passes the attempts already made: 1 before the second attempt, 2 before the third.
    expect(invitationDeliveryBackoff(1)).toBe(5_000);
    expect(invitationDeliveryBackoff(2)).toBe(10_000);
  });

  it('[C56] names each job by its invitation so a second add is ignored', async () => {
    const add = vi.fn(async () => ({}));
    const sut = new InvitationDeliveryQueueProducer({
      add,
    } as unknown as Queue);

    await sut.enqueue('invitation-1');
    await sut.enqueue('invitation-1');

    expect(add).toHaveBeenCalledTimes(2);
    for (const call of add.mock.calls as unknown[][]) {
      expect(call[1]).toEqual({ invitationId: 'invitation-1' });
      expect(call[2]).toMatchObject({
        jobId: 'invitation-1',
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
  });

  it('[C56] asks the queue for a retry only when the attempt can be tried again', async () => {
    const outcomes: DeliverInvitationOutcome[] = [
      'retry',
      'delivered',
      'failed',
      'skipped',
    ];
    for (const outcome of outcomes) {
      const handle = vi.fn(async () => ({ outcome }));
      const sut = new InvitationDeliveryQueueConsumer({
        handle,
      } as unknown as DeliverInvitationUseCase);
      const job = { data: { invitationId: 'invitation-1' } } as Job<{
        invitationId: string;
      }>;

      const processed = sut.process(job);

      if (outcome === 'retry')
        await expect(processed, outcome).rejects.toThrow();
      else await expect(processed, outcome).resolves.toBeUndefined();
      expect(handle).toHaveBeenCalledWith({ invitationId: 'invitation-1' });
    }
  });
});
