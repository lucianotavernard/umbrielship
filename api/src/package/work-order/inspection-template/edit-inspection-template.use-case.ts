import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

type EditInspectionTemplateUseCaseRequest = {
  organizationId: string;
  id: string;
  name: string;
  labels: string[];
};

type EditInspectionTemplateUseCaseResponse = {
  inspectionTemplate: InspectionTemplate;
};

@Injectable()
export class EditInspectionTemplateUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle({
    organizationId,
    id,
    name,
    labels,
  }: EditInspectionTemplateUseCaseRequest): Promise<EditInspectionTemplateUseCaseResponse> {
    const inspectionTemplate =
      await this.inspectionTemplatesRepository.findById(organizationId, id);

    if (!inspectionTemplate) {
      throw new NotFoundDomainException('Inspection template not found');
    }

    const named = await this.inspectionTemplatesRepository.findByName(
      organizationId,
      name,
    );

    if (named && named.id !== inspectionTemplate.id) {
      throw new AlreadyExistsDomainException(
        'Inspection template already exists',
      );
    }

    inspectionTemplate.replace(name, labels);

    await this.inspectionTemplatesRepository.save(inspectionTemplate);

    return { inspectionTemplate };
  }
}
