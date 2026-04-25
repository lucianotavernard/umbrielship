import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type GetWorkOrderServiceByIdUseCaseRequest = {
  workOrderId: string;
  serviceId: string;
};

type GetWorkOrderServiceByIdUseCaseResponse = {
  service: NonNullable<
    Awaited<ReturnType<WorkOrderServiceRepository['findById']>>
  >;
};

@Injectable()
export class GetWorkOrderServiceByIdUseCase {
  constructor(
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
  ) {}

  async handle(
    input: GetWorkOrderServiceByIdUseCaseRequest,
  ): Promise<GetWorkOrderServiceByIdUseCaseResponse> {
    const service = await this.workOrderServiceRepository.findById(
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    return { service };
  }
}
