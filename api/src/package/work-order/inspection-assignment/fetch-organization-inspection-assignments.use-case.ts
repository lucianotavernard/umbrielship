import { Injectable } from '@nestjs/common';

import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignmentSummary } from './inspection-assignment-summary.entity.js';

type FetchOrganizationInspectionAssignmentsUseCaseRequest = {
  organizationId: string;
};

type FetchOrganizationInspectionAssignmentsUseCaseResponse = {
  inspectionAssignments: InspectionAssignmentSummary[];
};

@Injectable()
export class FetchOrganizationInspectionAssignmentsUseCase {
  constructor(
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
  }: FetchOrganizationInspectionAssignmentsUseCaseRequest): Promise<FetchOrganizationInspectionAssignmentsUseCaseResponse> {
    const inspectionAssignments =
      await this.inspectionAssignmentsRepository.findMany(organizationId);

    return { inspectionAssignments };
  }
}
