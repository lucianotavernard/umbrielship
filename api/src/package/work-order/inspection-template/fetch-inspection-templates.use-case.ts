import { Injectable } from '@nestjs/common';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

export const INSPECTION_TEMPLATES_PER_PAGE = 10;

type FetchInspectionTemplatesUseCaseRequest = {
  organizationId: string;
  page: number;
};

type FetchInspectionTemplatesUseCaseResponse = {
  inspectionTemplates: InspectionTemplate[];
  total: number;
};

@Injectable()
export class FetchInspectionTemplatesUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle({
    organizationId,
    page,
  }: FetchInspectionTemplatesUseCaseRequest): Promise<FetchInspectionTemplatesUseCaseResponse> {
    const { data, total } = await this.inspectionTemplatesRepository.findMany(
      organizationId,
      INSPECTION_TEMPLATES_PER_PAGE,
      (page - 1) * INSPECTION_TEMPLATES_PER_PAGE,
    );

    return { inspectionTemplates: data, total };
  }
}
