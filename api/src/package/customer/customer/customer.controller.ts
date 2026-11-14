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

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles, WRITERS } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { CreateCustomerUseCase } from './create-customer.use-case.js';
import { DeleteCustomerUseCase } from './delete-customer.use-case.js';
import { EditCustomerUseCase } from './edit-customer.use-case.js';
import { FetchCustomersUseCase } from './fetch-customers.use-case.js';
import { GetCustomerByIdUseCase } from './get-customer-by-id.use-case.js';

const customerBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable().optional(),
  address: z.object({
    address: z.string(),
    state: z.string(),
    city: z.string(),
  }),
});

type CustomerBodySchema = z.infer<typeof customerBodySchema>;

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/customers')
export class CustomerController {
  constructor(
    private createCustomer: CreateCustomerUseCase,
    private deleteCustomer: DeleteCustomerUseCase,
    private editCustomer: EditCustomerUseCase,
    private fetchCustomers: FetchCustomersUseCase,
    private getCustomerById: GetCustomerByIdUseCase,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: UserPayload,
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const take = page * 10;
    const skip = (page - 1) * 10;

    const result = await this.fetchCustomers.handle({
      organizationId: user.organizationId,
      take,
      skip,
    });

    return {
      customers: result.customers,
      total: result.total,
    };
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('id') customerId: string,
  ) {
    try {
      const { customer } = await this.getCustomerById.handle({
        organizationId: user.organizationId,
        id: customerId,
      });

      return { customer };
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
    @Body(new ZodValidationPipe(customerBodySchema)) body: CustomerBodySchema,
  ) {
    try {
      const { name, email, phone, address } = body;

      const result = await this.createCustomer.handle({
        organizationId: user.organizationId,
        name,
        email,
        phone,
        address,
      });

      return { customer: result.customer };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles(...WRITERS)
  @Put(':id')
  async edit(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(customerBodySchema)) body: CustomerBodySchema,
    @Param('id') customerId: string,
  ) {
    try {
      const { name, email, phone, address } = body;

      const result = await this.editCustomer.handle({
        organizationId: user.organizationId,
        customerId,
        name,
        email,
        phone,
        address,
      });

      return { customer: result.customer };
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

  @Roles(...WRITERS)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('id') customerId: string,
  ) {
    try {
      await this.deleteCustomer.handle({
        organizationId: user.organizationId,
        id: customerId,
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
