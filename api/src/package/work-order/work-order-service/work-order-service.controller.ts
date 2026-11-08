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
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator';
import type { UserPayload } from '@/package/shared/module/auth/user-payload';

import { CreateWorkOrderServiceUseCase } from './create-work-order-service.use-case';
import { DeleteWorkOrderServiceUseCase } from './delete-work-order-service.use-case';
import { EditWorkOrderServiceUseCase } from './edit-work-order-service.use-case';
import { FetchWorkOrderServicesUseCase } from './fetch-work-order-services.use-case';
import { GetWorkOrderServiceByIdUseCase } from './get-work-order-service-by-id.use-case';
import { WORK_ORDER_SERVICE_STATUSES } from './work-order-service.entity';

const workOrderServiceBodySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(WORK_ORDER_SERVICE_STATUSES),
});

type WorkOrderServiceBodySchema = z.infer<typeof workOrderServiceBodySchema>;

@Controller('/work-orders/:workOrderId/services')
export class WorkOrderServiceController {
  constructor(
    private createWorkOrderService: CreateWorkOrderServiceUseCase,
    private deleteWorkOrderService: DeleteWorkOrderServiceUseCase,
    private editWorkOrderService: EditWorkOrderServiceUseCase,
    private fetchWorkOrderServices: FetchWorkOrderServicesUseCase,
    private getWorkOrderServiceById: GetWorkOrderServiceByIdUseCase,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
  ) {
    try {
      const { services } = await this.fetchWorkOrderServices.handle({
        organizationId: user.organizationId,
        workOrderId,
      });

      return { services };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      const { service } = await this.getWorkOrderServiceById.handle({
        organizationId: user.organizationId,
        workOrderId,
        serviceId,
      });

      return { service };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(workOrderServiceBodySchema))
    body: WorkOrderServiceBodySchema,
    @Param('workOrderId') workOrderId: string,
  ) {
    try {
      const { service } = await this.createWorkOrderService.handle({
        organizationId: user.organizationId,
        workOrderId,
        ...body,
      });

      return { service };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Put(':id')
  async edit(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(workOrderServiceBodySchema))
    body: WorkOrderServiceBodySchema,
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      const { service } = await this.editWorkOrderService.handle({
        organizationId: user.organizationId,
        workOrderId,
        serviceId,
        ...body,
      });

      return { service };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
    @Param('id') serviceId: string,
  ) {
    try {
      await this.deleteWorkOrderService.handle({
        organizationId: user.organizationId,
        workOrderId,
        serviceId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
