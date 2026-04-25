import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { GetWorkOrderServiceByIdUseCase } from '@/work-order/core/use-case/get-work-order-service-by-id.use-case';

@Controller('/work-orders/:workOrderId/services/:id')
export class GetWorkOrderServiceController {
  constructor(
    private readonly getWorkOrderServiceById: GetWorkOrderServiceByIdUseCase,
  ) {}

  @Get()
  async handle(
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      const { service } = await this.getWorkOrderServiceById.handle({
        workOrderId,
        serviceId,
      });

      return { service };
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
