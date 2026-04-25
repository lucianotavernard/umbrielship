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

import { WorkOrderServiceStatusEnum } from '@/work-order/core/entity/work-order-service.entity';
import { EditWorkOrderServiceUseCase } from '@/work-order/core/use-case/edit-work-order-service.use-case';

const editWorkOrderServiceBodySchema = z.object({
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

type EditWorkOrderServiceBodySchema = z.infer<
  typeof editWorkOrderServiceBodySchema
>;

@Controller('/work-orders/:workOrderId/services/:id')
export class EditWorkOrderServiceController {
  constructor(
    private readonly editWorkOrderService: EditWorkOrderServiceUseCase,
  ) {}

  @Put()
  async handle(
    @Body(new ZodValidationPipe(editWorkOrderServiceBodySchema))
    body: EditWorkOrderServiceBodySchema,
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      const result = await this.editWorkOrderService.handle({
        workOrderId,
        serviceId,
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
