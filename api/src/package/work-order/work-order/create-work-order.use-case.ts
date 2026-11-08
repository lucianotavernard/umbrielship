import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { WorkOrder, WorkOrderStatus } from './work-order.entity';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';
import { IVesselsRepository } from '@/package/customer/vessel/contracts/vessel-repository.contract';

type CreateWorkOrderUseCaseRequest = {
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

type CreateWorkOrderUseCaseResponse = {
  workOrder: WorkOrder;
};

@Injectable()
export class CreateWorkOrderUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly vesselsRepository: IVesselsRepository,
  ) {}

  async handle({
    vesselId,
    startDate,
    endDate,
    status,
  }: CreateWorkOrderUseCaseRequest): Promise<CreateWorkOrderUseCaseResponse> {
    const vessel = await this.vesselsRepository.findById(vesselId);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    const workOrder = WorkOrder.create({
      vesselId,
      startDate,
      endDate,
      status,
    });

    await this.workOrdersRepository.create(workOrder);

    return { workOrder };
  }
}
