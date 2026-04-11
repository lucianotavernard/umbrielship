import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { VesselEntity } from '../entity/vessel.entity';
import { VesselRepository } from '../interface/vessel.repository';

type GetVesselByIdUseCaseRequest = {
  id: string;
};

type GetVesselByIdUseCaseResponse = {
  vessel: VesselEntity;
};

@Injectable()
export class GetVesselByIdUseCase {
  constructor(private vesselRepository: VesselRepository) {}

  async handle({
    id,
  }: GetVesselByIdUseCaseRequest): Promise<GetVesselByIdUseCaseResponse> {
    const vessel = await this.vesselRepository.findById(id);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    return {
      vessel,
    };
  }
}
