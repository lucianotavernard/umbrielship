import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { GetWorkOrderByIdUseCase } from '@/work-order/core/use-case/get-work-order-by-id.use-case';

@Controller('/work-orders/:id')
export class GetWorkOrderController {
  constructor(private readonly getWorkOrderById: GetWorkOrderByIdUseCase) {}

  @Get()
  async handle(@Param('id') workOrderId: string) {
    try {
      const { workOrder } = await this.getWorkOrderById.handle({
        id: workOrderId,
      });

      return {
        workOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
