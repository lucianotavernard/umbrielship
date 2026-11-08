import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import {
  WorkOrderService,
  WorkOrderServiceStatus,
} from './work-order-service.entity';
import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract';

type CreateWorkOrderServiceUseCaseRequest = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

type CreateWorkOrderServiceUseCaseResponse = {
  service: WorkOrderService;
};

@Injectable()
export class CreateWorkOrderServiceUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
  ) {}

  async handle(
    input: CreateWorkOrderServiceUseCaseRequest,
  ): Promise<CreateWorkOrderServiceUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      input.workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const service = WorkOrderService.create({
      workOrderId: input.workOrderId,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
    });

    await this.workOrderServicesRepository.create(service);

    return { service };
  }
}
