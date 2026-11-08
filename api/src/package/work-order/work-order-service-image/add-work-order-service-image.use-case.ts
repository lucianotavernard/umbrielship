import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { WorkOrderServiceImage } from './work-order-service-image.entity';
import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract';

type AddWorkOrderServiceImageUseCaseRequest = {
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
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const image = WorkOrderServiceImage.create({
      serviceId: input.serviceId,
      url: input.url,
    });

    await this.workOrderServiceImagesRepository.create(image);

    return { image };
  }
}
