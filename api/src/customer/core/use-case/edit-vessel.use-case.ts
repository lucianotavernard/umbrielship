import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { VesselEntity, VesselType } from '../entity/vessel.entity';
import { VesselRepository } from '../interface/vessel.repository';

type EditVesselUseCaseRequest = {
  vesselId: string;
  customerId: string;
  name: string;
  type: VesselType;
  length: number;
};

type EditVesselUseCaseResponse = {
  vessel: VesselEntity;
};

@Injectable()
export class EditVesselUseCase {
  constructor(private vesselRepository: VesselRepository) {}

  async handle({
    vesselId,
    customerId,
    name,
    type,
    length,
  }: EditVesselUseCaseRequest): Promise<EditVesselUseCaseResponse> {
    const vessel = await this.vesselRepository.findById(vesselId);

    if (!vessel || vessel.customerId !== customerId) {
      throw new NotFoundDomainException('Vessel not found');
    }

    vessel.name = name;
    vessel.type = type;
    vessel.length = length;

    await this.vesselRepository.save(vessel);

    return {
      vessel,
    };
  }
}
