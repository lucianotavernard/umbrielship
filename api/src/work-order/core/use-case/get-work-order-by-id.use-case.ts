import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderDetailEntity } from '../entity/work-order-detail.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';

type GetWorkOrderByIdUseCaseRequest = {
  id: string;
};

type GetWorkOrderByIdUseCaseResponse = {
  workOrder: WorkOrderDetailEntity;
};

@Injectable()
export class GetWorkOrderByIdUseCase {
  constructor(private readonly workOrderRepository: WorkOrderRepository) {}

  async handle({
    id,
  }: GetWorkOrderByIdUseCaseRequest): Promise<GetWorkOrderByIdUseCaseResponse> {
    const workOrder = await this.workOrderRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    return { workOrder };
  }
}
