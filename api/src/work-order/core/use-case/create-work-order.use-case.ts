import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import {
  WorkOrderEntity,
  WorkOrderStatus,
} from '../entity/work-order.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';
import { VesselRepository } from '@/customer/core/interface/vessel.repository';

type CreateWorkOrderUseCaseRequest = {
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

type CreateWorkOrderUseCaseResponse = {
  workOrder: WorkOrderEntity;
};

@Injectable()
export class CreateWorkOrderUseCase {
  constructor(
    private readonly workOrderRepository: WorkOrderRepository,
    private readonly vesselRepository: VesselRepository,
  ) {}

  async handle({
    vesselId,
    startDate,
    endDate,
    status,
  }: CreateWorkOrderUseCaseRequest): Promise<CreateWorkOrderUseCaseResponse> {
    const vessel = await this.vesselRepository.findById(vesselId);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    const workOrder = new WorkOrderEntity({
      vesselId,
      startDate,
      endDate,
      status,
    });

    await this.workOrderRepository.create(workOrder);

    return { workOrder };
  }
}
