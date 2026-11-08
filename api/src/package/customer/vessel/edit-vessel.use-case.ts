import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { Vessel, VesselType } from './vessel.entity';
import { IVesselsRepository } from './contracts/vessel-repository.contract';

type EditVesselUseCaseRequest = {
  vesselId: string;
  customerId: string;
  name: string;
  type: VesselType;
  length: number;
};

type EditVesselUseCaseResponse = {
  vessel: Vessel;
};

@Injectable()
export class EditVesselUseCase {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async handle({
    vesselId,
    customerId,
    name,
    type,
    length,
  }: EditVesselUseCaseRequest): Promise<EditVesselUseCaseResponse> {
    const vessel = await this.vesselsRepository.findById(vesselId);

    if (!vessel || vessel.customerId !== customerId) {
      throw new NotFoundDomainException('Vessel not found');
    }

    vessel.name = name;
    vessel.type = type;
    vessel.length = length;

    await this.vesselsRepository.save(vessel);

    return {
      vessel,
    };
  }
}
