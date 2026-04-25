import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import {
  WorkOrderServiceEntity,
  WorkOrderServiceStatus,
} from '../entity/work-order-service.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type CreateWorkOrderServiceUseCaseRequest = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

type CreateWorkOrderServiceUseCaseResponse = {
  service: WorkOrderServiceEntity;
};

@Injectable()
export class CreateWorkOrderServiceUseCase {
  constructor(
    private readonly workOrderRepository: WorkOrderRepository,
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
  ) {}

  async handle(
    input: CreateWorkOrderServiceUseCaseRequest,
  ): Promise<CreateWorkOrderServiceUseCaseResponse> {
    const workOrder = await this.workOrderRepository.findById(
      input.workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const service = new WorkOrderServiceEntity({
      workOrderId: input.workOrderId,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
    });

    await this.workOrderServiceRepository.create(service);

    return { service };
  }
}
