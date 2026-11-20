import { Injectable } from '@nestjs/common';

import { ICustomersRepository } from './customer/contracts/customer-repository.contract.js';
import { IVesselsRepository } from './vessel/contracts/vessel-repository.contract.js';

export type VesselSummary = {
  id: string;
  name: string;
  type: string;
  length: number;
  customerId: string;
};

// The only way another context reads a Vessel or asks whether an Organization has Customers:
// plain data, no entity, no repository.
@Injectable()
export class CustomerFacade {
  constructor(
    private vesselsRepository: IVesselsRepository,
    private customersRepository: ICustomersRepository,
  ) {}

  /** Whether the Organization still has a Customer; its Vessels and addresses belong to one. */
  async hasRecords(organizationId: string): Promise<boolean> {
    const { total } = await this.customersRepository.findMany(organizationId, 1, 0);

    return total > 0;
  }

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
