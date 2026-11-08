import { Injectable } from '@nestjs/common';

import { IVesselsRepository } from './vessel/contracts/vessel-repository.contract.js';

export type VesselSummary = {
  id: string;
  name: string;
  type: string;
  length: number;
  customerId: string;
};

// The only way another context reads a Vessel: plain data, no entity, no repository.
@Injectable()
export class CustomerFacade {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async findVesselById(
    organizationId: string,
    id: string,
  ): Promise<VesselSummary | null> {
    const vessel = await this.vesselsRepository.findById(organizationId, id);

    if (!vessel) {
      return null;
    }

    return {
      id: vessel.id,
      name: vessel.name,
      type: vessel.type,
      length: vessel.length,
      customerId: vessel.customerId,
    };
  }
}
