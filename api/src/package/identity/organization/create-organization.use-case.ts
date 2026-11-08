import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { IOrganizationsRepository } from './contracts/organization-repository.contract';
import { Organization } from './organization.entity';

type CreateOrganizationUseCaseRequest = {
  name: string;
  email: string;
};

type CreateOrganizationUseCaseResponse = {
  organization: {
    id: string;
    name: string;
    email: string;
    isInternal: boolean;
  };
};

@Injectable()
export class CreateOrganizationUseCase {
  constructor(private organizationsRepository: IOrganizationsRepository) {}

  async handle(
    createOrganizationDto: CreateOrganizationUseCaseRequest,
  ): Promise<CreateOrganizationUseCaseResponse> {
    const emailExists = await this.organizationsRepository.findByEmail(
      createOrganizationDto.email,
    );
    if (emailExists)
      throw new AlreadyExistsDomainException('Organization already exists');

    const nameExists = await this.organizationsRepository.findByName(
      createOrganizationDto.name,
    );
    if (nameExists)
      throw new AlreadyExistsDomainException(
        'Organization name already exists',
      );

    const organization = Organization.create({
      ...createOrganizationDto,
      isInternal: false,
    });

    await this.organizationsRepository.save(organization);

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
