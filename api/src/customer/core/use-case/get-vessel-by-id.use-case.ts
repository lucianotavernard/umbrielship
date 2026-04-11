import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { VesselRepository } from '../interface/vessel.repository';
import { VesselDetailEntity } from '../entity/vessel-detail.entity';

type GetVesselByIdUseCaseRequest = {
  id: string;
};

type GetVesselByIdUseCaseResponse = {
  vessel: VesselDetailEntity;
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
