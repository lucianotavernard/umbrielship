import { Injectable, Logger } from '@nestjs/common';

import { InvitationDeliveryQueue } from './contracts/invitation-delivery-queue.contract.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';

type RecoverInvitationDeliveriesUseCaseResponse = {
  enqueued: number;
};

// The invitations table is the source of truth: whatever is still queued there goes back on the queue.
@Injectable()
export class RecoverInvitationDeliveriesUseCase {
  private readonly logger = new Logger('identity');

  constructor(
    private invitationsRepository: IInvitationsRepository,
    private invitationDeliveryQueue: InvitationDeliveryQueue,
  ) {}

  async handle(): Promise<RecoverInvitationDeliveriesUseCaseResponse> {
    // An accepted Invitation needs no delivery, even when it still reads queued, as the migration left every existing one.
    const invitations = (
      await this.invitationsRepository.findManyByDeliveryStatus('queued')
    ).filter((invitation) => invitation.status === 'pending');

    let enqueued = 0;
    for (const invitation of invitations) {
      try {
        await this.invitationDeliveryQueue.enqueue(invitation.id);
        enqueued++;
      } catch (error) {
        this.logger.error(
          JSON.stringify({
            operation: 'invitation_enqueue_failed',
            organizationId: invitation.organizationId,
            invitationId: invitation.id,
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    }

    return { enqueued };
  }
}
