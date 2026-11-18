import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import { IInspectionsRepository } from '../inspection/contracts/inspection-repository.contract.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

type DeleteWorkOrderUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteWorkOrderUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly inspectionsRepository: IInspectionsRepository,
    private readonly workforceFacade: WorkforceFacade,
  ) {}

  async handle({
    organizationId,
    id,
  }: DeleteWorkOrderUseCaseRequest): Promise<void> {
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      id,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    // D5: inspected work stays, discarded Inspections included.
    const inspections = await this.inspectionsRepository.countByWorkOrderId(
      organizationId,
      id,
    );

    if (inspections > 0) {
      throw new ConflictDomainException('Work order has inspections');
    }

    // Its services' Assignments go with it (AD-064).
    await this.workforceFacade.removeByWorkOrderId(organizationId, id);
    await this.workOrdersRepository.delete(id);
  }
}
