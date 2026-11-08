import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { IOrganizationsRepository } from './contracts/organization-repository.contract';

type GetOrganizationByIdUseCaseResponse = {
  organization: {
    id: string;
    name: string;
    email: string;
    isInternal: boolean;
  };
};

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async handle(
    organizationId: string,
  ): Promise<GetOrganizationByIdUseCaseResponse> {
    const organization =
      await this.organizationsRepository.findById(organizationId);
    if (!organization)
      throw new NotFoundDomainException('Organization not found');

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        isInternal: organization.isInternal,
      },
    };
  }
}
