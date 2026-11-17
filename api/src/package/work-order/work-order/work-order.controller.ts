import {
  Body,
  ConflictException,
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

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
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
import { WorkOrderSummary } from './work-order-summary.entity.js';

const createWorkOrderBodySchema = z.object({
  vesselId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(WORK_ORDER_STATUSES),
  // Stored with the WorkOrder's period, PENDING, in the same transaction.
  services: z
    .array(z.object({ name: z.string().min(1), description: z.string() }))
    .max(50)
    .optional(),
});

type CreateWorkOrderBodySchema = z.infer<typeof createWorkOrderBodySchema>;

const editWorkOrderBodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(WORK_ORDER_STATUSES),
});

type EditWorkOrderBodySchema = z.infer<typeof editWorkOrderBodySchema>;

const vesselIdQueryParamSchema = z.string().uuid().optional();

// No `take` and no `skip` answers every WorkOrder; either one pages (`take` 10 and `skip` 0 by default).
const takeQueryParamSchema = z
  .string()
  .optional()
  .transform((take) => (take === undefined ? undefined : Number(take)))
  .pipe(z.number().int().min(1).max(100).optional());

const skipQueryParamSchema = z
  .string()
  .optional()
  .transform((skip) => (skip === undefined ? undefined : Number(skip)))
  .pipe(z.number().int().min(0).optional());

type VesselIdQueryParamSchema = z.infer<typeof vesselIdQueryParamSchema>;
type TakeQueryParamSchema = z.infer<typeof takeQueryParamSchema>;
type SkipQueryParamSchema = z.infer<typeof skipQueryParamSchema>;

const present = ({
  id,
  vesselId,
  startDate,
  endDate,
  status,
  services,
}: WorkOrderSummary) => ({
  id,
  vesselId,
  startDate,
  endDate,
  status,
  services: services.map(({ id, name, startDate, endDate, status }) => ({
    id,
    name,
    startDate,
    endDate,
    status,
  })),
});

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
    const paged = take !== undefined || skip !== undefined;

    const result = await this.fetchWorkOrders.handle({
      organizationId: user.organizationId,
      vesselId,
      take: paged ? (take ?? 10) : undefined,
      skip: paged ? (skip ?? 0) : undefined,
    });

    return {
      workOrders: result.workOrders.map(present),
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
      const { vesselId, startDate, endDate, status, services } = body;

      const result = await this.createWorkOrder.handle({
        organizationId: user.organizationId,
        vesselId,
        startDate,
        endDate,
        status,
        services,
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

      if (error instanceof ConflictDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
