import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

type CreateInspectionTemplateUseCaseRequest = {
  organizationId: string;
  name: string;
  labels: string[];
};

type CreateInspectionTemplateUseCaseResponse = {
  inspectionTemplate: InspectionTemplate;
};

@Injectable()
export class CreateInspectionTemplateUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle({
    organizationId,
    name,
    labels,
  }: CreateInspectionTemplateUseCaseRequest): Promise<CreateInspectionTemplateUseCaseResponse> {
    const existing = await this.inspectionTemplatesRepository.findByName(
      organizationId,
      name,
    );

    if (existing) {
      throw new AlreadyExistsDomainException(
        'Inspection template already exists',
      );
    }

    const inspectionTemplate = InspectionTemplate.create({
      organizationId,
      name,
      labels,
    });

    await this.inspectionTemplatesRepository.create(inspectionTemplate);

    return { inspectionTemplate };
  }
}
