import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { WorkOrderServiceImageRepository } from '../interface/work-order-service-image.repository';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type RemoveWorkOrderServiceImageUseCaseRequest = {
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
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
    private readonly workOrderServiceImageRepository: WorkOrderServiceImageRepository,
  ) {}

  async handle(
    input: RemoveWorkOrderServiceImageUseCaseRequest,
  ): Promise<void> {
    const service = await this.workOrderServiceRepository.findById(
      input.serviceId,
    );

    if (!service || service.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    const image = await this.workOrderServiceImageRepository.findById(
      input.imageId,
    );

    if (!image || image.serviceId !== input.serviceId) {
      throw new NotFoundDomainException('Work order service image not found');
    }

    const filePath = absolutePathFromStoredUrl(image.url);

    await this.workOrderServiceImageRepository.delete(input.imageId);

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
