import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract';
import { IUsersRepository } from './contracts/user-repository.contract';
import { Role } from './user.entity';

type FetchOrganizationUsersUseCaseRequest = {
  organizationId: string;
  page: number;
  perPage: number;
};

type FetchOrganizationUsersUseCaseResponse = {
  users: {
    id: string;
    name: string;
    email: string;
    role: Role;
  }[];
  total: number;
};

@Injectable()
export class FetchOrganizationUsersUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
  ) {}

  async handle({
    organizationId,
    page,
    perPage,
  }: FetchOrganizationUsersUseCaseRequest): Promise<FetchOrganizationUsersUseCaseResponse> {
    const organization =
      await this.organizationsRepository.findById(organizationId);
    if (!organization)
      throw new NotFoundDomainException('Organization not found');

    const users = await this.usersRepository.findManyByOrganization(
      organization.id,
      page,
      perPage,
    );
    const total = await this.usersRepository.countByOrganization(
      organization.id,
    );

    const result: FetchOrganizationUsersUseCaseResponse['users'] = [];
    for (const user of users) {
      const membership = user.memberships.find(
        (membership) => membership.organizationId === organization.id,
      );
      if (!membership) continue;

      result.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
      });
    }

    return {
      users: result,
      total,
    };
  }
}
