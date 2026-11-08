import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { DeliverInvitationUseCase } from './deliver-invitation.use-case.js';
import {
  INVITATION_DELIVERY_QUEUE,
  InvitationDeliveryJobData,
  invitationDeliveryBackoff,
} from './invitation-delivery.queue.js';

// Like a controller: it calls the use case, and turns a failed attempt into a retry the queue schedules.
@Processor(INVITATION_DELIVERY_QUEUE, {
  concurrency: 1,
  settings: { backoffStrategy: invitationDeliveryBackoff },
})
export class InvitationDeliveryQueueConsumer extends WorkerHost {
  constructor(private deliverInvitation: DeliverInvitationUseCase) {
    super();
  }

  async process(job: Job<InvitationDeliveryJobData>): Promise<void> {
    const { outcome } = await this.deliverInvitation.handle({
      invitationId: job.data.invitationId,
    });

    if (outcome === 'retry')
      throw new Error('Invitation delivery attempt failed');
  }
}
