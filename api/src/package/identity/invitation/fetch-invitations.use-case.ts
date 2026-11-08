import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { Role } from '../user/user.entity.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';
import {
  InvitationDeliveryStatus,
  InvitationStatus,
} from './invitation.entity.js';

type FetchInvitationsUseCaseRequest = {
  organizationId: string;
  page: number;
  perPage: number;
};

type FetchInvitationsUseCaseResponse = {
  invitations: {
    id: string;
    email: string;
    role: Role;
    status: InvitationStatus;
    deliveryStatus: InvitationDeliveryStatus;
  }[];
  total: number;
};

@Injectable()
export class FetchInvitationsUseCase {
  constructor(
    private invitationsRepository: IInvitationsRepository,
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle({
    organizationId,
    page,
    perPage,
  }: FetchInvitationsUseCaseRequest): Promise<FetchInvitationsUseCaseResponse> {
    const organization =
      await this.organizationsRepository.findById(organizationId);
    if (!organization)
      throw new NotFoundDomainException('Organization not found');

    const invitations = await this.invitationsRepository.findManyByOrganization(
      organization.id,
      page,
      perPage,
    );
    const total = await this.invitationsRepository.countByOrganization(
      organization.id,
    );

    const result: FetchInvitationsUseCaseResponse['invitations'] = [];
    for (const invitation of invitations) {
      const user = await this.usersRepository.findById(invitation.userId);

      result.push({
        id: invitation.id,
        email: user?.email ?? '',
        role: invitation.role,
        status: invitation.status,
        deliveryStatus: invitation.deliveryStatus,
      });
    }

    return {
      invitations: result,
      total,
    };
  }
}
