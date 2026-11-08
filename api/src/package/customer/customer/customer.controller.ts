import {
  Body,
  ConflictException,
  Controller,
  Get,
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

import { CreateCustomerUseCase } from './create-customer.use-case';
import { EditCustomerUseCase } from './edit-customer.use-case';
import { FetchCustomersUseCase } from './fetch-customers.use-case';
import { GetCustomerByIdUseCase } from './get-customer-by-id.use-case';

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
    private editCustomer: EditCustomerUseCase,
    private fetchCustomers: FetchCustomersUseCase,
    private getCustomerById: GetCustomerByIdUseCase,
  ) {}

  @Get()
  async get(
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const take = page * 10;
    const skip = (page - 1) * 10;

    const result = await this.fetchCustomers.handle({ take, skip });

    return {
      customers: result.customers,
      total: result.total,
    };
  }

  @Get(':id')
  async getById(@Param('id') customerId: string) {
    try {
      const { customer } = await this.getCustomerById.handle({
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

  @Post()
  async create(
    @Body(new ZodValidationPipe(customerBodySchema)) body: CustomerBodySchema,
  ) {
    try {
      const { name, email, phone, address } = body;

      const result = await this.createCustomer.handle({
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

  @Put(':id')
  async edit(
    @Body(new ZodValidationPipe(customerBodySchema)) body: CustomerBodySchema,
    @Param('id') customerId: string,
  ) {
    try {
      const { name, email, phone, address } = body;

      const result = await this.editCustomer.handle({
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
}
