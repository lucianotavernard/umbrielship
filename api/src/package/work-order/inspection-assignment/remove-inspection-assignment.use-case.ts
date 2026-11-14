import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';

type RemoveInspectionAssignmentUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  id: string;
};

@Injectable()
export class RemoveInspectionAssignmentUseCase {
  constructor(
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
    workOrderId,
    id,
  }: RemoveInspectionAssignmentUseCaseRequest): Promise<void> {
    const assignment = await this.inspectionAssignmentsRepository.findById(
      organizationId,
      id,
    );

    if (!assignment || assignment.workOrderId !== workOrderId) {
      throw new NotFoundDomainException('Inspection assignment not found');
    }

    await this.inspectionAssignmentsRepository.delete(organizationId, id);
  }
}
