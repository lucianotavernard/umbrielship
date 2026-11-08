import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { Role } from '../user/user.entity.js';

type ProfileOrganization = {
  id: string;
  name: string;
  isInternal: boolean;
  role: Role;
};

type GetProfileUseCaseResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    organization: {
      id: string;
      name: string;
      isInternal: boolean;
    };
    organizations: ProfileOrganization[];
  };
};

@Injectable()
export class GetProfileUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle(userId: string): Promise<GetProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundDomainException('User not found');

    const organizations: ProfileOrganization[] = [];
    for (const membership of user.memberships) {
      const organization = await this.organizationsRepository.findById(
        membership.organizationId,
      );
      if (!organization) continue;

      organizations.push({
        id: organization.id,
        name: organization.name,
        isInternal: organization.isInternal,
        role: membership.role,
      });
    }
    organizations.sort((a, b) => a.name.localeCompare(b.name));

    const active = organizations.find(
      (organization) => organization.id === user.activeOrganizationId,
    );
    if (!active) throw new NotFoundDomainException('Organization not found');

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: active.role,
        organization: {
          id: active.id,
          name: active.name,
          isInternal: active.isInternal,
        },
        organizations,
      },
    };
  }
}
