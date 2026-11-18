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
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { CreateStaffUseCase } from './create-staff.use-case.js';
import { DeleteStaffUseCase } from './delete-staff.use-case.js';
import { FetchStaffUseCase } from './fetch-staff.use-case.js';
import { GetStaffByIdUseCase } from './get-staff-by-id.use-case.js';
import { Staff } from './staff.entity.js';
import { UpdateStaffUseCase } from './update-staff.use-case.js';

// The bounds hold after trimming, as the use case stores the values.
const staffBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  specialty: z.string().trim().min(1).max(100),
  email: z.string().trim().pipe(z.email().max(254)),
  phone: z.string().trim().min(1).max(30),
  teamId: z.uuid().nullable().optional(),
});

type StaffBodySchema = z.infer<typeof staffBodySchema>;

const present = ({ id, name, specialty, email, phone, teamId }: Staff) => ({
  id,
  name,
  specialty,
  email,
  phone,
  teamId,
});

@Controller('/staff')
export class StaffController {
  constructor(
    private createStaff: CreateStaffUseCase,
    private deleteStaff: DeleteStaffUseCase,
    private fetchStaff: FetchStaffUseCase,
    private getStaffById: GetStaffByIdUseCase,
    private updateStaff: UpdateStaffUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() user: UserPayload) {
    const { staff } = await this.fetchStaff.handle({
      organizationId: user.organizationId,
    });

    return { staff: staff.map(present) };
  }

  @Get(':id')
  async getById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    try {
      const { staff } = await this.getStaffById.handle({
        organizationId: user.organizationId,
        id,
      });

      return { staff: present(staff) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(staffBodySchema)) body: StaffBodySchema,
  ) {
    try {
      const { staff } = await this.createStaff.handle({
        organizationId: user.organizationId,
        ...body,
      });

      return { staff: present(staff) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Put(':id')
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(staffBodySchema)) body: StaffBodySchema,
  ) {
    try {
      const { staff } = await this.updateStaff.handle({
        organizationId: user.organizationId,
        id,
        ...body,
      });

      return { staff: present(staff) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    try {
      await this.deleteStaff.handle({
        organizationId: user.organizationId,
        id,
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
