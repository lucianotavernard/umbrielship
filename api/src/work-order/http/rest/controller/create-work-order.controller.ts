import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { WorkOrderStatusEnum } from '@/work-order/core/entity/work-order.entity';
import { CreateWorkOrderUseCase } from '@/work-order/core/use-case/create-work-order.use-case';

const createWorkOrderBodySchema = z.object({
  vesselId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(
    Object.values(WorkOrderStatusEnum) as [
      WorkOrderStatusEnum,
      ...WorkOrderStatusEnum[],
    ],
  ),
});

type CreateWorkOrderBodySchema = z.infer<typeof createWorkOrderBodySchema>;

@Controller('/work-orders')
export class CreateWorkOrderController {
  constructor(private readonly createWorkOrder: CreateWorkOrderUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createWorkOrderBodySchema))
    body: CreateWorkOrderBodySchema,
  ) {
    try {
      const { vesselId, startDate, endDate, status } = body;

      const result = await this.createWorkOrder.handle({
        vesselId,
        startDate,
        endDate,
        status,
      });

      return {
        workOrder: result.workOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
