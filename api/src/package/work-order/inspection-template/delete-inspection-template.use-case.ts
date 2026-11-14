import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';

type DeleteInspectionTemplateUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteInspectionTemplateUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle({
    organizationId,
    id,
  }: DeleteInspectionTemplateUseCaseRequest): Promise<void> {
    const inspectionTemplate =
      await this.inspectionTemplatesRepository.findById(organizationId, id);

    if (!inspectionTemplate) {
      throw new NotFoundDomainException('Inspection template not found');
    }

    await this.inspectionTemplatesRepository.delete(organizationId, id);
  }
}
