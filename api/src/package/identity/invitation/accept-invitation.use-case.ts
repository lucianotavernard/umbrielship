import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';

type AcceptInvitationUseCaseRequest = {
  secret: string;
};

type AcceptInvitationUseCaseResponse = {
  organizationName: string;
};

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private invitationsRepository: IInvitationsRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle({
    secret,
  }: AcceptInvitationUseCaseRequest): Promise<AcceptInvitationUseCaseResponse> {
    const invitation = await this.invitationsRepository.findBySecret(secret);
    if (!invitation) throw new NotFoundDomainException('Invitation not found');

    if (invitation.status === 'accepted')
      throw new ConflictDomainException('Invitation already accepted');

    const destination = await this.organizationsRepository.findById(
      invitation.organizationId,
    );
    if (!destination)
      throw new NotFoundDomainException('Organization not found');

    await this.invitationsRepository.accept(invitation);

    return {
      organizationName: destination.name,
    };
  }
}
