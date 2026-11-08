import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { InvitationDeliveryQueue } from './contracts/invitation-delivery-queue.contract.js';
import {
  INVITATION_DELIVERY_QUEUE,
  InvitationDeliveryJobData,
  invitationDeliveryJobOptions,
} from './invitation-delivery.queue.js';

// Redis down makes the client wait for a reconnect; the request does not wait longer than this.
const ENQUEUE_TIMEOUT_MS = 2_000;

@Injectable()
export class InvitationDeliveryQueueProducer implements InvitationDeliveryQueue {
  constructor(
    @InjectQueue(INVITATION_DELIVERY_QUEUE)
    private readonly queue: Queue<InvitationDeliveryJobData>,
  ) {}

  async enqueue(invitationId: string): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(new Error(`Queue did not answer in ${ENQUEUE_TIMEOUT_MS} ms`)),
        ENQUEUE_TIMEOUT_MS,
      );
    });

    try {
      await Promise.race([
        this.queue.add(
          'deliver',
          { invitationId },
          invitationDeliveryJobOptions(invitationId),
        ),
        timeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
}
