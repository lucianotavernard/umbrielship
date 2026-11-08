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

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator';
import type { UserPayload } from '@/package/shared/module/auth/user-payload';

import { CreateVesselUseCase } from './create-vessel.use-case';
import { DeleteVesselUseCase } from './delete-vessel.use-case';
import { EditVesselUseCase } from './edit-vessel.use-case';
import { FetchVesselsUseCase } from './fetch-vessels.use-case';
import { GetVesselByIdUseCase } from './get-vessel-by-id.use-case';
import { VESSEL_TYPES } from './vessel.entity';

const createVesselBodySchema = z.object({
  customerId: z.uuid(),
  imoNumber: z.string(),
  name: z.string(),
  type: z.enum(VESSEL_TYPES),
  length: z.number().positive(),
});

type CreateVesselBodySchema = z.infer<typeof createVesselBodySchema>;

const editVesselBodySchema = z.object({
  customerId: z.uuid(),
  name: z.string(),
  type: z.enum(VESSEL_TYPES),
  length: z.number().positive(),
});

type EditVesselBodySchema = z.infer<typeof editVesselBodySchema>;

const customerIdQueryParamSchema = z.string().optional();

type CustomerIdQueryParamSchema = z.infer<typeof customerIdQueryParamSchema>;

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller()
export class VesselController {
  constructor(
    private createVessel: CreateVesselUseCase,
    private deleteVessel: DeleteVesselUseCase,
    private editVessel: EditVesselUseCase,
    private fetchVessels: FetchVesselsUseCase,
    private getVesselById: GetVesselByIdUseCase,
  ) {}

  @Get('/vessels')
  async get(
    @CurrentUser() user: UserPayload,
    @Query('customerId', new ZodValidationPipe(customerIdQueryParamSchema))
    customerId: CustomerIdQueryParamSchema,
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const take = page * 10;
    const skip = (page - 1) * 10;

    const result = await this.fetchVessels.handle({
      organizationId: user.organizationId,
      customerId,
      take,
      skip,
    });

    return {
      vessels: result.vessels,
      total: result.total,
    };
  }

  @Get('/vessels/:id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('id') vesselId: string,
  ) {
    try {
      const { vessel } = await this.getVesselById.handle({
        organizationId: user.organizationId,
        id: vesselId,
      });

      return { vessel };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Post('/vessels')
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createVesselBodySchema))
    body: CreateVesselBodySchema,
  ) {
    try {
      const { customerId, imoNumber, name, type, length } = body;

      const result = await this.createVessel.handle({
        organizationId: user.organizationId,
        imoNumber,
        name,
        type,
        length,
        customerId,
      });

      return { vessel: result.vessel };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Put('/customers/:customerId/vessels/:id')
  async edit(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editVesselBodySchema))
    body: EditVesselBodySchema,
    @Param('id') vesselId: string,
  ) {
    try {
      const { name, type, length, customerId } = body;

      const result = await this.editVessel.handle({
        organizationId: user.organizationId,
        vesselId,
        customerId,
        name,
        type,
        length,
      });

      return { vessel: result.vessel };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Delete('/vessels/:id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('id') vesselId: string,
  ) {
    try {
      await this.deleteVessel.handle({
        organizationId: user.organizationId,
        id: vesselId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
