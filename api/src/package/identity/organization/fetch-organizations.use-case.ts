import { Injectable } from '@nestjs/common';

import { IOrganizationsRepository } from './contracts/organization-repository.contract.js';

type FetchOrganizationsUseCaseRequest = {
  page: number;
  perPage: number;
};

type FetchOrganizationsUseCaseResponse = {
  organizations: {
    id: string;
    name: string;
    email: string;
    isInternal: boolean;
  }[];
  total: number;
};

@Injectable()
export class FetchOrganizationsUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async handle({
    page,
    perPage,
  }: FetchOrganizationsUseCaseRequest): Promise<FetchOrganizationsUseCaseResponse> {
    const organizations = await this.organizationsRepository.findAll(
      page,
      perPage,
    );
    const total = await this.organizationsRepository.count();

    return {
      organizations: organizations.map((organization) => ({
        id: organization.id,
        name: organization.name,
        email: organization.email,
        isInternal: organization.isInternal,
      })),
      total,
    };
  }
}
