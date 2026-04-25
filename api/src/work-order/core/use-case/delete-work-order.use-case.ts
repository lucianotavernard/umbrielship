import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderRepository } from '../interface/work-order.repository';

type DeleteWorkOrderUseCaseRequest = {
  id: string;
};

@Injectable()
export class DeleteWorkOrderUseCase {
  constructor(private readonly workOrderRepository: WorkOrderRepository) {}

  async handle({ id }: DeleteWorkOrderUseCaseRequest): Promise<void> {
    const workOrder = await this.workOrderRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    await this.workOrderRepository.delete(id);
  }
}
