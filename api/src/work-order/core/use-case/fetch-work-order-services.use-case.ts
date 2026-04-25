import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceEntity } from '../entity/work-order-service.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type FetchWorkOrderServicesUseCaseRequest = {
  workOrderId: string;
};

type FetchWorkOrderServicesUseCaseResponse = {
  services: WorkOrderServiceEntity[];
};

@Injectable()
export class FetchWorkOrderServicesUseCase {
  constructor(
    private readonly workOrderRepository: WorkOrderRepository,
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
  ) {}

  async handle(
    input: FetchWorkOrderServicesUseCaseRequest,
  ): Promise<FetchWorkOrderServicesUseCaseResponse> {
    const workOrder = await this.workOrderRepository.findById(
      input.workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const services =
      await this.workOrderServiceRepository.findManyByWorkOrderId(
        input.workOrderId,
      );

    return { services };
  }
}
