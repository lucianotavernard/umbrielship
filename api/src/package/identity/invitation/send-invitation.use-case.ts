import { randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { Role } from '../user/user.entity.js';
import { InvitationDeliveryQueue } from './contracts/invitation-delivery-queue.contract.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';
import {
  Invitation,
  InvitationDeliveryStatus,
  InvitationStatus,
} from './invitation.entity.js';

type SendInvitationUseCaseRequest = {
  userId: string;
  organizationId: string;
  role: Role;
};

type SendInvitationUseCaseResponse = {
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
export class SendInvitationUseCase {
  private readonly logger = new Logger('identity');

  constructor(
    private invitationsRepository: IInvitationsRepository,
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
    private invitationDeliveryQueue: InvitationDeliveryQueue,
  ) {}

  async handle({
    userId,
    organizationId,
    role,
  }: SendInvitationUseCaseRequest): Promise<SendInvitationUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundDomainException('User not found');

    const destination =
      await this.organizationsRepository.findById(organizationId);
    if (!destination)
      throw new NotFoundDomainException('Organization not found');

    if (destination.isInternal)
      throw new ConflictDomainException(
        'The internal organization does not accept invitations',
      );

    const isMember = user.memberships.some(
      (membership) => membership.organizationId === destination.id,
    );
    if (isMember)
      throw new ConflictDomainException(
        'User already belongs to this organization',
      );

    const pending = await this.invitationsRepository.findPending(
      user.id,
      destination.id,
    );
    if (pending)
      throw new ConflictDomainException('Invitation already pending');

    const invitation = Invitation.create({
      userId: user.id,
      organizationId: destination.id,
      secret: randomBytes(32).toString('hex'),
      status: 'pending',
      role,
    });

    await this.invitationsRepository.save(invitation);

    // The Invitation is saved before it is queued: a queue that refuses leaves it queued for recovery at boot.
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

    return {
      invitation: {
        id: invitation.id,
        email: user.email,
        organizationName: destination.name,
        role: invitation.role,
        status: invitation.status,
        deliveryStatus: invitation.deliveryStatus,
      },
    };
  }
}
