import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles, WRITERS } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { CreateWorkOrderUseCase } from './create-work-order.use-case.js';
import { DeleteWorkOrderUseCase } from './delete-work-order.use-case.js';
import { EditWorkOrderUseCase } from './edit-work-order.use-case.js';
import { FetchWorkOrdersUseCase } from './fetch-work-orders.use-case.js';
import { GetWorkOrderByIdUseCase } from './get-work-order-by-id.use-case.js';
import { WORK_ORDER_STATUSES } from './work-order.entity.js';

const createWorkOrderBodySchema = z.object({
  vesselId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(WORK_ORDER_STATUSES),
});

type CreateWorkOrderBodySchema = z.infer<typeof createWorkOrderBodySchema>;

const editWorkOrderBodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(WORK_ORDER_STATUSES),
});

type EditWorkOrderBodySchema = z.infer<typeof editWorkOrderBodySchema>;

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
export class WorkOrderController {
  constructor(
    private createWorkOrder: CreateWorkOrderUseCase,
    private deleteWorkOrder: DeleteWorkOrderUseCase,
    private editWorkOrder: EditWorkOrderUseCase,
    private fetchWorkOrders: FetchWorkOrdersUseCase,
    private getWorkOrderById: GetWorkOrderByIdUseCase,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: UserPayload,
    @Query('vesselId', new ZodValidationPipe(vesselIdQueryParamSchema))
    vesselId: VesselIdQueryParamSchema,
    @Query('take', new ZodValidationPipe(takeQueryParamSchema))
    take: TakeQueryParamSchema,
    @Query('skip', new ZodValidationPipe(skipQueryParamSchema))
    skip: SkipQueryParamSchema,
  ) {
    const result = await this.fetchWorkOrders.handle({
      organizationId: user.organizationId,
      vesselId,
      take,
      skip,
    });

    return {
      workOrders: result.workOrders,
      total: result.total,
    };
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('id') workOrderId: string,
  ) {
    try {
      const { workOrder } = await this.getWorkOrderById.handle({
        organizationId: user.organizationId,
        id: workOrderId,
      });

      return { workOrder };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles(...WRITERS)
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createWorkOrderBodySchema))
    body: CreateWorkOrderBodySchema,
  ) {
    try {
      const { vesselId, startDate, endDate, status } = body;

      const result = await this.createWorkOrder.handle({
        organizationId: user.organizationId,
        vesselId,
        startDate,
        endDate,
        status,
      });

      return { workOrder: result.workOrder };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles(...WRITERS)
  @Put(':id')
  async edit(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editWorkOrderBodySchema))
    body: EditWorkOrderBodySchema,
    @Param('id') workOrderId: string,
  ) {
    try {
      const { startDate, endDate, status } = body;

      const result = await this.editWorkOrder.handle({
        organizationId: user.organizationId,
        workOrderId,
        startDate,
        endDate,
        status,
      });

      return { workOrder: result.workOrder };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles(...WRITERS)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('id') workOrderId: string,
  ) {
    try {
      await this.deleteWorkOrder.handle({
        organizationId: user.organizationId,
        id: workOrderId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
