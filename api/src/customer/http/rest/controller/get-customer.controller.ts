import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';

import { GetCustomerByIdUseCase } from '@/customer/core/use-case/get-customer-by-id.use-case';
import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

@Controller('/customers/:id')
export class GetCustomerByIdController {
  constructor(private getCustomerById: GetCustomerByIdUseCase) {}

  @Get()
  async handle(@Param('id') customerId: string) {
    try {
      const { customer } = await this.getCustomerById.handle({
        id: customerId,
      });

      return {
        customer,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
