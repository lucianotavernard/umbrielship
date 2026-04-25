import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { FetchWorkOrderServicesUseCase } from '@/work-order/core/use-case/fetch-work-order-services.use-case';

@Controller('/work-orders/:workOrderId/services')
export class FetchWorkOrderServicesController {
  constructor(
    private readonly fetchWorkOrderServices: FetchWorkOrderServicesUseCase,
  ) {}

  @Get()
  async handle(@Param('workOrderId') workOrderId: string) {
    try {
      const { services } = await this.fetchWorkOrderServices.handle({
        workOrderId,
      });

      return { services };
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
