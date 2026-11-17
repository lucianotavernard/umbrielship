import { Injectable } from '@nestjs/common';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

// Both given: that page; neither: every template of the Organization.
type FetchInspectionTemplatesUseCaseRequest = { organizationId: string } & (
  | { page: number; perPage: number }
  | { page?: undefined; perPage?: undefined }
);

type FetchInspectionTemplatesUseCaseResponse = {
  inspectionTemplates: InspectionTemplate[];
  total: number;
};

@Injectable()
export class FetchInspectionTemplatesUseCase {
  constructor(
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  async handle(
    request: FetchInspectionTemplatesUseCaseRequest,
  ): Promise<FetchInspectionTemplatesUseCaseResponse> {
    const { organizationId } = request;

    const { data, total } =
      request.page === undefined
        ? await this.inspectionTemplatesRepository.findMany(organizationId)
        : await this.inspectionTemplatesRepository.findMany(
            organizationId,
            request.perPage,
            (request.page - 1) * request.perPage,
          );

    return { inspectionTemplates: data, total };
  }
}
