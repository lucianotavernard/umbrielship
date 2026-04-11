import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { AlreadyExistsDomainException } from '@/shared/lib/core/exception/already-exists-domain.exception';

import { VesselEntity, VesselType } from '../entity/vessel.entity';
import { CustomerRepository } from '../interface/customer.repository';
import { VesselRepository } from '../interface/vessel.repository';

type CreateVesselUseCaseRequest = {
  imoNumber: string;
  name: string;
  type: VesselType;
  length: number;
  customerId: string;
};

type CreateVesselUseCaseResponse = {
  vessel: VesselEntity;
};

@Injectable()
export class CreateVesselUseCase {
  constructor(
    private vesselRepository: VesselRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async handle({
    imoNumber,
    name,
    type,
    length,
    customerId,
  }: CreateVesselUseCaseRequest): Promise<CreateVesselUseCaseResponse> {
    const existing = await this.vesselRepository.findByImoNumber(imoNumber);

    if (existing) {
      throw new AlreadyExistsDomainException('Vessel already exists');
    }

    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    const vessel = new VesselEntity({
      imoNumber,
      name,
      type,
      length,
      customerId,
    });

    await this.vesselRepository.create(vessel);

    return {
      vessel,
    };
  }
}
