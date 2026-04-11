import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { GetVesselByIdUseCase } from '@/customer/core/use-case/get-vessel-by-id.use-case';

@Controller('/vessels/:id')
export class GetVesselController {
  constructor(private getVesselById: GetVesselByIdUseCase) {}

  @Get()
  async handle(@Param('id') vesselId: string) {
    try {
      const { vessel } = await this.getVesselById.handle({
        id: vesselId,
      });

      return {
        vessel,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
