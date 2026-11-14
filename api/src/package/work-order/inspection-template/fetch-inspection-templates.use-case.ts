import { Injectable } from '@nestjs/common';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

type FetchInspectionTemplatesUseCaseRequest = {
  organizationId: string;
  page: number;
  perPage: number;
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
    perPage,
  }: FetchInspectionTemplatesUseCaseRequest): Promise<FetchInspectionTemplatesUseCaseResponse> {
    const { data, total } = await this.inspectionTemplatesRepository.findMany(
      organizationId,
      perPage,
      (page - 1) * perPage,
    );

    return { inspectionTemplates: data, total };
  }
}
