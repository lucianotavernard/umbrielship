import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { DeleteWorkOrderServiceUseCase } from '@/work-order/core/use-case/delete-work-order-service.use-case';

@Controller('/work-orders/:workOrderId/services/:id')
export class DeleteWorkOrderServiceController {
  constructor(
    private readonly deleteWorkOrderService: DeleteWorkOrderServiceUseCase,
  ) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      await this.deleteWorkOrderService.handle({
        workOrderId,
        serviceId,
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
