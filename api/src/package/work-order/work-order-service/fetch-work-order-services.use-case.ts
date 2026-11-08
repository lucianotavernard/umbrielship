import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { WorkOrderService } from './work-order-service.entity';
import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract';

type FetchWorkOrderServicesUseCaseRequest = {
  workOrderId: string;
};

type FetchWorkOrderServicesUseCaseResponse = {
  services: WorkOrderService[];
};

@Injectable()
export class FetchWorkOrderServicesUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
  ) {}

  async handle(
    input: FetchWorkOrderServicesUseCaseRequest,
  ): Promise<FetchWorkOrderServicesUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      input.workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const services =
      await this.workOrderServicesRepository.findManyByWorkOrderId(
        input.workOrderId,
      );

    return { services };
  }
}
