import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { DeleteVesselUseCase } from '@/customer/core/use-case/delete-vessel.use-case';

@Controller('/customers/:customerId/vessels/:id')
export class DeleteVesselController {
  constructor(private deleteVessel: DeleteVesselUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('customerId') customerId: string,
    @Param('id') vesselId: string,
  ) {
    try {
      await this.deleteVessel.handle({
        id: vesselId,
        customerId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
