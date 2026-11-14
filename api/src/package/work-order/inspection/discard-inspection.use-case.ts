import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionAssignmentsRepository } from '../inspection-assignment/contracts/inspection-assignment-repository.contract.js';
import { IInspectionsRepository } from './contracts/inspection-repository.contract.js';

type DiscardInspectionUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  assignmentId: string;
  id: string;
  discardedBy: string;
};

@Injectable()
export class DiscardInspectionUseCase {
  constructor(
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
    private readonly inspectionsRepository: IInspectionsRepository,
  ) {}

  async handle({
    organizationId,
    workOrderId,
    assignmentId,
    id,
    discardedBy,
  }: DiscardInspectionUseCaseRequest): Promise<void> {
    const assignment = await this.inspectionAssignmentsRepository.findById(
      organizationId,
      assignmentId,
    );
    // A discarded Inspection is not visible, so it is not found again.
    const inspection = await this.inspectionsRepository.findVisibleById(
      organizationId,
      id,
    );

    if (
      !assignment ||
      assignment.workOrderId !== workOrderId ||
      !inspection ||
      inspection.assignmentId !== assignment.id
    ) {
      throw new NotFoundDomainException('Inspection not found');
    }

    inspection.discard(discardedBy);

    await this.inspectionsRepository.saveDiscard(inspection);
  }
}
