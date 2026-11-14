import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionsRepository } from '../inspection/contracts/inspection-repository.contract.js';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract.js';

type DeleteWorkOrderServiceUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
};

@Injectable()
export class DeleteWorkOrderServiceUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly inspectionsRepository: IInspectionsRepository,
  ) {}

  async handle(input: DeleteWorkOrderServiceUseCaseRequest): Promise<void> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    // D5: a service an Inspection targets stays, discarded Inspections included.
    const inspections = await this.inspectionsRepository.countByServiceId(
      input.organizationId,
      input.serviceId,
    );

    if (inspections > 0) {
      throw new ConflictDomainException('Work order service has inspections');
    }

    await this.workOrderServicesRepository.delete(input.serviceId);
  }
}
