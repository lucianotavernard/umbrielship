import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IAssignmentsRepository } from '../assignment/contracts/assignment-repository.contract.js';
import { IStaffRepository } from './contracts/staff-repository.contract.js';

type DeleteStaffUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteStaffUseCase {
  constructor(
    private readonly staffRepository: IStaffRepository,
    private readonly assignmentsRepository: IAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
    id,
  }: DeleteStaffUseCaseRequest): Promise<void> {
    const staff = await this.staffRepository.findById(organizationId, id);

    if (!staff) {
      throw new NotFoundDomainException('Staff not found');
    }

    // A Staff that answers for a WorkOrderService stays (AD-064).
    if (
      (await this.assignmentsRepository.countByStaffId(organizationId, id)) > 0
    ) {
      throw new ConflictDomainException('Staff has Assignment');
    }

    await this.staffRepository.delete(organizationId, id);
  }
}
