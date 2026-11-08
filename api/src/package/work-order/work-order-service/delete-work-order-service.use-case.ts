import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

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
  ) {}

  async handle(input: DeleteWorkOrderServiceUseCaseRequest): Promise<void> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    await this.workOrderServicesRepository.delete(input.serviceId);
  }
}
