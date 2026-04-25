import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceImageEntity } from '../entity/work-order-service-image.entity';
import { WorkOrderServiceImageRepository } from '../interface/work-order-service-image.repository';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type FetchWorkOrderServiceImagesUseCaseRequest = {
  workOrderId: string;
  serviceId: string;
};

type FetchWorkOrderServiceImagesUseCaseResponse = {
  images: WorkOrderServiceImageEntity[];
};

@Injectable()
export class FetchWorkOrderServiceImagesUseCase {
  constructor(
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
    private readonly workOrderServiceImageRepository: WorkOrderServiceImageRepository,
  ) {}

  async handle(
    input: FetchWorkOrderServiceImagesUseCaseRequest,
  ): Promise<FetchWorkOrderServiceImagesUseCaseResponse> {
    const service = await this.workOrderServiceRepository.findById(
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const images =
      await this.workOrderServiceImageRepository.findManyByServiceId(
        input.serviceId,
      );

    return { images };
  }
}
