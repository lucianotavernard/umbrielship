import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { FetchWorkOrdersUseCase } from '@/work-order/core/use-case/fetch-work-orders.use-case';

const vesselIdQueryParamSchema = z.string().uuid().optional();

const takeQueryParamSchema = z
  .string()
  .optional()
  .default('10')
  .transform(Number)
  .pipe(z.number().int().min(1).max(100));

const skipQueryParamSchema = z
  .string()
  .optional()
  .default('0')
  .transform(Number)
  .pipe(z.number().int().min(0));

type VesselIdQueryParamSchema = z.infer<typeof vesselIdQueryParamSchema>;
type TakeQueryParamSchema = z.infer<typeof takeQueryParamSchema>;
type SkipQueryParamSchema = z.infer<typeof skipQueryParamSchema>;

@Controller('/work-orders')
export class FetchWorkOrdersController {
  constructor(private readonly fetchWorkOrders: FetchWorkOrdersUseCase) {}

  @Get()
  async handle(
    @Query('vesselId', new ZodValidationPipe(vesselIdQueryParamSchema))
    vesselId: VesselIdQueryParamSchema,
    @Query('take', new ZodValidationPipe(takeQueryParamSchema))
    take: TakeQueryParamSchema,
    @Query('skip', new ZodValidationPipe(skipQueryParamSchema))
    skip: SkipQueryParamSchema,
  ) {
    const result = await this.fetchWorkOrders.handle({
      vesselId,
      take,
      skip,
    });

    return {
      workOrders: result.workOrders,
      total: result.total,
    };
  }
}
