import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { FetchWorkOrderServiceImagesUseCase } from '@/work-order/core/use-case/fetch-work-order-service-images.use-case';

@Controller('/work-orders/:workOrderId/services/:serviceId/images')
export class FetchWorkOrderServiceImagesController {
  constructor(
    private readonly fetchWorkOrderServiceImages: FetchWorkOrderServiceImagesUseCase,
  ) {}

  @Get()
  async handle(
    @Param('workOrderId') workOrderId: string,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      const { images } = await this.fetchWorkOrderServiceImages.handle({
        workOrderId,
        serviceId,
      });

      return { images };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Bad request',
      );
    }
  }
}
