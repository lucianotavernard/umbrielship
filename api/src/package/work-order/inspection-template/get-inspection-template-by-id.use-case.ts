import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

type GetInspectionTemplateByIdUseCaseRequest = {
  organizationId: string;
  id: string;
};

type GetInspectionTemplateByIdUseCaseResponse = {
  inspectionTemplate: InspectionTemplate;
};

@Injectable()
export class GetInspectionTemplateByIdUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle({
    organizationId,
    id,
  }: GetInspectionTemplateByIdUseCaseRequest): Promise<GetInspectionTemplateByIdUseCaseResponse> {
    const inspectionTemplate =
      await this.inspectionTemplatesRepository.findById(organizationId, id);

    if (!inspectionTemplate) {
      throw new NotFoundDomainException('Inspection template not found');
    }

    return { inspectionTemplate };
  }
}
