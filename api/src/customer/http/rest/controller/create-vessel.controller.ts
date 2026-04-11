import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { AlreadyExistsDomainException } from '@/shared/lib/core/exception/already-exists-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { VesselTypeEnum } from '@/customer/core/entity/vessel.entity';
import { CreateVesselUseCase } from '@/customer/core/use-case/create-vessel.use-case';

const createVesselBodySchema = z.object({
  customerId: z.uuid(),
  imoNumber: z.string(),
  name: z.string(),
  type: z.enum(Object.values(VesselTypeEnum)),
  length: z.number().positive(),
});

type CreateVesselBodySchema = z.infer<typeof createVesselBodySchema>;

@Controller('/vessels')
export class CreateVesselController {
  constructor(private createVessel: CreateVesselUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createVesselBodySchema))
    body: CreateVesselBodySchema,
    @Param('customerId') customerId: string,
  ) {
    try {
      const { customerId, imoNumber, name, type, length } = body;

      const result = await this.createVessel.handle({
        imoNumber,
        name,
        type,
        length,
        customerId,
      });

      return {
        vessel: result.vessel,
      };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
