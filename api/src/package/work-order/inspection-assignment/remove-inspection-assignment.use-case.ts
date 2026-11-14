import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
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

    if (!assignment.removable) {
      throw new ConflictDomainException(
        'Inspection assignment has inspections',
      );
    }

    await this.inspectionAssignmentsRepository.delete(organizationId, id);
  }
}
