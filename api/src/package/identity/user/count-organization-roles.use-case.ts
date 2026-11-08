import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from './contracts/user-repository.contract.js';
import { Role } from './user.entity.js';

type CountOrganizationRolesUseCaseRequest = {
  organizationId: string;
};

type CountOrganizationRolesUseCaseResponse = {
  roles: {
    role: Role;
    users: number;
  }[];
};

// Every Role is listed, in this order, even when no Membership holds it.
const roles: Role[] = ['administrator', 'operator'];

@Injectable()
export class CountOrganizationRolesUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle({
    organizationId,
  }: CountOrganizationRolesUseCaseRequest): Promise<CountOrganizationRolesUseCaseResponse> {
    const organization =
      await this.organizationsRepository.findById(organizationId);
    if (!organization)
      throw new NotFoundDomainException('Organization not found');

    const result: CountOrganizationRolesUseCaseResponse['roles'] = [];
    for (const role of roles) {
      result.push({
        role,
        users: await this.usersRepository.countByOrganizationAndRole(
          organization.id,
          role,
        ),
      });
    }

    return {
      roles: result,
    };
  }
}
