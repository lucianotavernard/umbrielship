import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { RemoveWorkOrderServiceImageUseCase } from '@/work-order/core/use-case/remove-work-order-service-image.use-case';

@Controller('/work-orders/:workOrderId/services/:serviceId/images/:id')
export class DeleteWorkOrderServiceImageController {
  constructor(
    private readonly removeWorkOrderServiceImage: RemoveWorkOrderServiceImageUseCase,
  ) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('workOrderId') workOrderId: string,
    @Param('serviceId') serviceId: string,
    @Param('id') imageId: string,
  ) {
    try {
      await this.removeWorkOrderServiceImage.handle({
        workOrderId,
        serviceId,
        imageId,
      });
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
