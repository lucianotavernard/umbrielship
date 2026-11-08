import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IVesselsRepository } from './contracts/vessel-repository.contract.js';
import { VesselDetail } from './vessel-detail.entity.js';

type GetVesselByIdUseCaseRequest = {
  organizationId: string;
  id: string;
};

type GetVesselByIdUseCaseResponse = {
  vessel: VesselDetail;
};

@Injectable()
export class GetVesselByIdUseCase {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async handle({
    organizationId,
    id,
  }: GetVesselByIdUseCaseRequest): Promise<GetVesselByIdUseCaseResponse> {
    const vessel = await this.vesselsRepository.findById(organizationId, id);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    return {
      vessel,
    };
  }
}
