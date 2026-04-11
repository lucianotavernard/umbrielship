import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { VesselRepository } from '../interface/vessel.repository';

type DeleteVesselUseCaseRequest = {
  id: string;
  customerId: string;
};

@Injectable()
export class DeleteVesselUseCase {
  constructor(private vesselRepository: VesselRepository) {}

  async handle({ id, customerId }: DeleteVesselUseCaseRequest): Promise<void> {
    const vessel = await this.vesselRepository.findById(id);

    if (!vessel || vessel.customerId !== customerId) {
      throw new NotFoundDomainException('Vessel not found');
    }

    await this.vesselRepository.delete(id);
  }
}
