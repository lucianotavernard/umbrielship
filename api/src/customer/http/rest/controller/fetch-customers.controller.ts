import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { FetchCustomersUseCase } from '@/customer/core/use-case/fetch-customers.use-case';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/customers')
export class FetchCustomersController {
  constructor(private fetchCustomers: FetchCustomersUseCase) {}

  @Get()
  async handle(
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const take = page * 10;
    const skip = (page - 1) * 10;

    const result = await this.fetchCustomers.handle({
      take,
      skip,
    });

    return {
      customers: result.customers,
      total: result.total,
    };
  }
}
