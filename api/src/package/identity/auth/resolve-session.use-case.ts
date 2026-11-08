import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';

type ResolveSessionUseCaseRequest = {
  userId: string;
};

@Injectable()
export class ResolveSessionUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle({ userId }: ResolveSessionUseCaseRequest): Promise<UserPayload> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundDomainException('User not found');

    const membership = user.memberships.find(
      (item) => item.organizationId === user.activeOrganizationId,
    );
    if (!membership) throw new NotFoundDomainException('Membership not found');

    const organization = await this.organizationsRepository.findById(
      membership.organizationId,
    );
    if (!organization) {
      throw new NotFoundDomainException('Organization not found');
    }

    return {
      sub: user.id,
      organizationId: organization.id,
      role: membership.role,
      internal: organization.isInternal,
    };
  }
}
