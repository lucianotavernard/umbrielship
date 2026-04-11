import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { AlreadyExistsDomainException } from '@/shared/lib/core/exception/already-exists-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { EditCustomerUseCase } from '@/customer/core/use-case/edit-customer.use-case';

const editCustomerBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable().optional(),
  address: z.object({
    address: z.string(),
    state: z.string(),
    city: z.string(),
  }),
});

type EditCustomerBodySchema = z.infer<typeof editCustomerBodySchema>;

@Controller('/customers/:id')
export class EditCustomerController {
  constructor(private editCustomer: EditCustomerUseCase) {}

  @Put()
  async handle(
    @Body(new ZodValidationPipe(editCustomerBodySchema))
    body: EditCustomerBodySchema,
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

      return {
        customer: result.customer,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
