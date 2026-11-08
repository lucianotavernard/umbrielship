import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { WorkOrderServiceImage } from './work-order-service-image.entity.js';
import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract.js';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';

type FetchWorkOrderServiceImagesUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
};

type FetchWorkOrderServiceImagesUseCaseResponse = {
  images: WorkOrderServiceImage[];
};

@Injectable()
export class FetchWorkOrderServiceImagesUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly workOrderServiceImagesRepository: IWorkOrderServiceImagesRepository,
  ) {}

  async handle(
    input: FetchWorkOrderServiceImagesUseCaseRequest,
  ): Promise<FetchWorkOrderServiceImagesUseCaseResponse> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const images =
      await this.workOrderServiceImagesRepository.findManyByServiceId(
        input.organizationId,
        input.serviceId,
      );

    return { images };
  }
}
