import { Injectable } from '@nestjs/common';

import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { IOrganizationsRepository } from './contracts/organization-repository.contract.js';

/** How many members each Organization of the list shows by name; the rest are counted. */
export const MEMBER_PREVIEW = 4;

type FetchOrganizationsUseCaseRequest = {
  page: number;
  perPage: number;
  search?: string;
};

type FetchOrganizationsUseCaseResponse = {
  organizations: {
    id: string;
    name: string;
    email: string;
    isInternal: boolean;
    members: { id: string; name: string }[];
    memberCount: number;
  }[];
  total: number;
};

@Injectable()
export class FetchOrganizationsUseCase {
  constructor(
    private organizationsRepository: IOrganizationsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async handle({
    page,
    perPage,
    search,
  }: FetchOrganizationsUseCaseRequest): Promise<FetchOrganizationsUseCaseResponse> {
    const organizations = await this.organizationsRepository.findAll(
      page,
      perPage,
      search,
    );
    const total = await this.organizationsRepository.count(search);

    return {
      organizations: await Promise.all(
        organizations.map(async (organization) => {
          const [members, memberCount] = await Promise.all([
            this.usersRepository.findManyByOrganization(
              organization.id,
              1,
              MEMBER_PREVIEW,
            ),
            this.usersRepository.countByOrganization(organization.id),
          ]);

          return {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            isInternal: organization.isInternal,
            members: members.map((member) => ({
              id: member.id,
              name: member.name,
            })),
            memberCount,
          };
        }),
      ),
      total,
    };
  }
}
