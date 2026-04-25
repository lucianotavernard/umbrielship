import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceImageEntity } from '../entity/work-order-service-image.entity';
import { WorkOrderServiceImageRepository } from '../interface/work-order-service-image.repository';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type AddWorkOrderServiceImageUseCaseRequest = {
  workOrderId: string;
  serviceId: string;
  url: string;
};

type AddWorkOrderServiceImageUseCaseResponse = {
  image: WorkOrderServiceImageEntity;
};

@Injectable()
export class AddWorkOrderServiceImageUseCase {
  constructor(
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
    private readonly workOrderServiceImageRepository: WorkOrderServiceImageRepository,
  ) {}

  async handle(
    input: AddWorkOrderServiceImageUseCaseRequest,
  ): Promise<AddWorkOrderServiceImageUseCaseResponse> {
    const service = await this.workOrderServiceRepository.findById(
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const image = new WorkOrderServiceImageEntity({
      serviceId: input.serviceId,
      url: input.url,
    });

    await this.workOrderServiceImageRepository.create(image);

    return { image };
  }
}
