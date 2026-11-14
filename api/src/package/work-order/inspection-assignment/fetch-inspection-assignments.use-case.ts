import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract.js';
import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignment } from './inspection-assignment.entity.js';

type FetchInspectionAssignmentsUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
};

type FetchInspectionAssignmentsUseCaseResponse = {
  inspectionAssignments: InspectionAssignment[];
};

@Injectable()
export class FetchInspectionAssignmentsUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
    workOrderId,
  }: FetchInspectionAssignmentsUseCaseRequest): Promise<FetchInspectionAssignmentsUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const inspectionAssignments =
      await this.inspectionAssignmentsRepository.findManyByWorkOrderId(
        organizationId,
        workOrder.id,
      );

    return { inspectionAssignments };
  }
}
