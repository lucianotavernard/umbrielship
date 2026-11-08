import { Injectable, Logger } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { Role } from '../user/user.entity.js';
import { InvitationDeliveryQueue } from './contracts/invitation-delivery-queue.contract.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';
import {
  InvitationDeliveryStatus,
  InvitationStatus,
} from './invitation.entity.js';

type ResendInvitationUseCaseRequest = {
  invitationId: string;
};

type ResendInvitationUseCaseResponse = {
  invitation: {
    id: string;
    email: string;
    organizationName: string;
    role: Role;
    status: InvitationStatus;
    deliveryStatus: InvitationDeliveryStatus;
  };
};

@Injectable()
export class ResendInvitationUseCase {
  private readonly logger = new Logger('identity');

  constructor(
    private invitationsRepository: IInvitationsRepository,
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
    private invitationDeliveryQueue: InvitationDeliveryQueue,
  ) {}

  async handle({
    invitationId,
  }: ResendInvitationUseCaseRequest): Promise<ResendInvitationUseCaseResponse> {
    const invitation = await this.invitationsRepository.findById(invitationId);
    if (!invitation) throw new NotFoundDomainException('Invitation not found');

    if (invitation.status === 'accepted')
      throw new ConflictDomainException('Invitation already accepted');

    // The secret stays: a link the User already holds keeps working.
    const requeued = await this.invitationsRepository.requeueDelivery(
      invitation.id,
    );
    if (!requeued) {
      const current = await this.invitationsRepository.findById(invitation.id);
      if (current?.status === 'accepted')
        throw new ConflictDomainException('Invitation already accepted');

      throw new ConflictDomainException('Invitation delivery already queued');
    }

    try {
      await this.invitationDeliveryQueue.enqueue(invitation.id);
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

    const user = await this.usersRepository.findById(invitation.userId);
    const organization = await this.organizationsRepository.findById(
      invitation.organizationId,
    );

    return {
      invitation: {
        id: invitation.id,
        email: user?.email ?? '',
        organizationName: organization?.name ?? '',
        role: invitation.role,
        status: invitation.status,
        deliveryStatus: 'queued',
      },
    };
  }
}
