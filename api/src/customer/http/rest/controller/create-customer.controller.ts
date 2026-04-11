import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/shared/lib/core/exception/already-exists-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { CreateCustomerUseCase } from '@/customer/core/use-case/create-customer.use-case';

const createCustomerBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable().optional(),
  address: z.object({
    address: z.string(),
    state: z.string(),
    city: z.string(),
  }),
});

type CreateCustomerBodySchema = z.infer<typeof createCustomerBodySchema>;

@Controller('/customers')
export class CreateCustomerController {
  constructor(private createCustomer: CreateCustomerUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCustomerBodySchema))
  async handle(@Body() body: CreateCustomerBodySchema) {
    try {
      const { name, email, phone, address } = body;

      const result = await this.createCustomer.handle({
        name,
        email,
        phone,
        address,
      });

      return {
        customer: result.customer,
      };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
