import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract.js';

type GetWorkOrderServiceByIdUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
};

type GetWorkOrderServiceByIdUseCaseResponse = {
  service: NonNullable<
    Awaited<ReturnType<IWorkOrderServicesRepository['findById']>>
  >;
};

@Injectable()
export class GetWorkOrderServiceByIdUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
  ) {}

  async handle(
    input: GetWorkOrderServiceByIdUseCaseRequest,
  ): Promise<GetWorkOrderServiceByIdUseCaseResponse> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    return { service };
  }
}
