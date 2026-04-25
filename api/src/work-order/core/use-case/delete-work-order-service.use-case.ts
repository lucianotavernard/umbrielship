import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type DeleteWorkOrderServiceUseCaseRequest = {
  workOrderId: string;
  serviceId: string;
};

@Injectable()
export class DeleteWorkOrderServiceUseCase {
  constructor(
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
  ) {}

  async handle(input: DeleteWorkOrderServiceUseCaseRequest): Promise<void> {
    const service = await this.workOrderServiceRepository.findById(
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    await this.workOrderServiceRepository.delete(input.serviceId);
  }
}
