import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { WorkOrder, WorkOrderStatus } from './work-order.entity';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';

type EditWorkOrderUseCaseRequest = {
  workOrderId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

type EditWorkOrderUseCaseResponse = {
  workOrder: WorkOrder;
};

@Injectable()
export class EditWorkOrderUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({
    workOrderId,
    startDate,
    endDate,
    status,
  }: EditWorkOrderUseCaseRequest): Promise<EditWorkOrderUseCaseResponse> {
    const existing = await this.workOrdersRepository.findById(workOrderId);

    if (!existing) {
      throw new NotFoundDomainException('Work order not found');
    }

    const workOrder = WorkOrder.create(
      {
        vesselId: existing.vesselId,
        startDate,
        endDate,
        status,
      },
      existing.id,
    );

    await this.workOrdersRepository.save(workOrder);

    return { workOrder };
  }
}
