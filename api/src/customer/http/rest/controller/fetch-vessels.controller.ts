import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { FetchVesselsUseCase } from '@/customer/core/use-case/fetch-vessels.use-case';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/customers/:customerId/vessels')
export class FetchVesselsController {
  constructor(private fetchVessels: FetchVesselsUseCase) {}

  @Get()
  async handle(
    @Param('customerId') customerId: string,
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const take = page * 10;
    const skip = (page - 1) * 10;

    const result = await this.fetchVessels.handle({
      customerId,
      take,
      skip,
    });

    return {
      vessels: result.vessels,
      total: result.total,
    };
  }
}
