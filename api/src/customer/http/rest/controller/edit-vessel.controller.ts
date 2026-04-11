import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { VesselTypeEnum } from '@/customer/core/entity/vessel.entity';
import { EditVesselUseCase } from '@/customer/core/use-case/edit-vessel.use-case';

const editVesselBodySchema = z.object({
  name: z.string(),
  type: z.enum(Object.values(VesselTypeEnum)),
  length: z.number().positive(),
});

type EditVesselBodySchema = z.infer<typeof editVesselBodySchema>;

@Controller('/customers/:customerId/vessels/:id')
export class EditVesselController {
  constructor(private editVessel: EditVesselUseCase) {}

  @Put()
  async handle(
    @Body(new ZodValidationPipe(editVesselBodySchema))
    body: EditVesselBodySchema,
    @Param('customerId') customerId: string,
    @Param('id') vesselId: string,
  ) {
    try {
      const { name, type, length } = body;

      const result = await this.editVessel.handle({
        vesselId,
        customerId,
        name,
        type,
        length,
      });

      return {
        vessel: result.vessel,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
