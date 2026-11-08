import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { WorkOrderServiceImage } from './work-order-service-image.entity.js';
import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract.js';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';

type AddWorkOrderServiceImageUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
  url: string;
};

type AddWorkOrderServiceImageUseCaseResponse = {
  image: WorkOrderServiceImage;
};

@Injectable()
export class AddWorkOrderServiceImageUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly workOrderServiceImagesRepository: IWorkOrderServiceImagesRepository,
  ) {}

  async handle(
    input: AddWorkOrderServiceImageUseCaseRequest,
  ): Promise<AddWorkOrderServiceImageUseCaseResponse> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const image = WorkOrderServiceImage.create({
      organizationId: input.organizationId,
      serviceId: input.serviceId,
      url: input.url,
    });

    await this.workOrderServiceImagesRepository.create(image);

    return { image };
  }
}
