import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { DeleteWorkOrderUseCase } from '@/work-order/core/use-case/delete-work-order.use-case';

@Controller('/work-orders/:id')
export class DeleteWorkOrderController {
  constructor(private readonly deleteWorkOrder: DeleteWorkOrderUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') workOrderId: string) {
    try {
      await this.deleteWorkOrder.handle({
        id: workOrderId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
