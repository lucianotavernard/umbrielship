import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { WorkOrderServiceStatusEnum } from '@/work-order/core/entity/work-order-service.entity';
import { CreateWorkOrderServiceUseCase } from '@/work-order/core/use-case/create-work-order-service.use-case';

const createWorkOrderServiceBodySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(
    Object.values(WorkOrderServiceStatusEnum) as [
      WorkOrderServiceStatusEnum,
      ...WorkOrderServiceStatusEnum[],
    ],
  ),
});

type CreateWorkOrderServiceBodySchema = z.infer<
  typeof createWorkOrderServiceBodySchema
>;

@Controller('/work-orders/:workOrderId/services')
export class CreateWorkOrderServiceController {
  constructor(
    private readonly createWorkOrderService: CreateWorkOrderServiceUseCase,
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createWorkOrderServiceBodySchema))
    body: CreateWorkOrderServiceBodySchema,
    @Param('workOrderId') workOrderId: string,
  ) {
    try {
      const result = await this.createWorkOrderService.handle({
        workOrderId,
        ...body,
      });

      return {
        service: result.service,
      };
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
