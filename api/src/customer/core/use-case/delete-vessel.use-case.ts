import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { VesselRepository } from '../interface/vessel.repository';

type DeleteVesselUseCaseRequest = {
  id: string;
};

@Injectable()
export class DeleteVesselUseCase {
  constructor(private vesselRepository: VesselRepository) {}

  async handle({ id }: DeleteVesselUseCaseRequest): Promise<void> {
    const vessel = await this.vesselRepository.findById(id);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    await this.vesselRepository.delete(id);
  }
}
