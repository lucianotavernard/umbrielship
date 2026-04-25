import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import {
  WorkOrderEntity,
  WorkOrderStatus,
} from '../entity/work-order.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';

type EditWorkOrderUseCaseRequest = {
  workOrderId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

type EditWorkOrderUseCaseResponse = {
  workOrder: WorkOrderEntity;
};

@Injectable()
export class EditWorkOrderUseCase {
  constructor(private readonly workOrderRepository: WorkOrderRepository) {}

  async handle({
    workOrderId,
    startDate,
    endDate,
    status,
  }: EditWorkOrderUseCaseRequest): Promise<EditWorkOrderUseCaseResponse> {
    const existing = await this.workOrderRepository.findById(workOrderId);

    if (!existing) {
      throw new NotFoundDomainException('Work order not found');
    }

    const workOrder = new WorkOrderEntity(
      {
        vesselId: existing.vesselId,
        startDate,
        endDate,
        status,
      },
      existing.id,
    );

    await this.workOrderRepository.save(workOrder);

    return { workOrder };
  }
}
