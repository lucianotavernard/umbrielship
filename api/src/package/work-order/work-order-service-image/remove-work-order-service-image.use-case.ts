import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract.js';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';

type RemoveWorkOrderServiceImageUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
  imageId: string;
};

function absolutePathFromStoredUrl(url: string): string {
  const trimmed = url.startsWith('/') ? url.slice(1) : url;
  return join(process.cwd(), trimmed);
}

@Injectable()
export class RemoveWorkOrderServiceImageUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly workOrderServiceImagesRepository: IWorkOrderServiceImagesRepository,
  ) {}

  async handle(
    input: RemoveWorkOrderServiceImageUseCaseRequest,
  ): Promise<void> {
    const service = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const image = await this.workOrderServiceImagesRepository.findById(
      input.organizationId,
      input.imageId,
    );

    if (!image || image.serviceId !== input.serviceId) {
      throw new NotFoundDomainException('Work order service image not found');
    }

    const filePath = absolutePathFromStoredUrl(image.url);

    await this.workOrderServiceImagesRepository.delete(input.imageId);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        throw err;
      }
    }
  }
}
