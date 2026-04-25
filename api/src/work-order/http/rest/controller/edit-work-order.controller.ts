import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { WorkOrderStatusEnum } from '@/work-order/core/entity/work-order.entity';
import { EditWorkOrderUseCase } from '@/work-order/core/use-case/edit-work-order.use-case';

const editWorkOrderBodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(
    Object.values(WorkOrderStatusEnum) as [
      WorkOrderStatusEnum,
      ...WorkOrderStatusEnum[],
    ],
  ),
});

type EditWorkOrderBodySchema = z.infer<typeof editWorkOrderBodySchema>;

@Controller('/work-orders/:id')
export class EditWorkOrderController {
  constructor(private readonly editWorkOrder: EditWorkOrderUseCase) {}

  @Put()
  async handle(
    @Body(new ZodValidationPipe(editWorkOrderBodySchema))
    body: EditWorkOrderBodySchema,
    @Param('id') workOrderId: string,
  ) {
    try {
      const { startDate, endDate, status } = body;

      const result = await this.editWorkOrder.handle({
        workOrderId,
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
