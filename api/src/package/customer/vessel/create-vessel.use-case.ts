import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';

import { Vessel, VesselType } from './vessel.entity';
import { ICustomersRepository } from '../customer/contracts/customer-repository.contract';
import { IVesselsRepository } from './contracts/vessel-repository.contract';

type CreateVesselUseCaseRequest = {
  imoNumber: string;
  name: string;
  type: VesselType;
  length: number;
  customerId: string;
};

type CreateVesselUseCaseResponse = {
  vessel: Vessel;
};

@Injectable()
export class CreateVesselUseCase {
  constructor(
    private vesselsRepository: IVesselsRepository,
    private customersRepository: ICustomersRepository,
  ) {}

  async handle({
    imoNumber,
    name,
    type,
    length,
    customerId,
  }: CreateVesselUseCaseRequest): Promise<CreateVesselUseCaseResponse> {
    const existing = await this.vesselsRepository.findByImoNumber(imoNumber);

    if (existing) {
      throw new AlreadyExistsDomainException('Vessel already exists');
    }

    const customer = await this.customersRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    const vessel = Vessel.create({
      imoNumber,
      name,
      type,
      length,
      customerId,
    });

    await this.vesselsRepository.create(vessel);

    return {
      vessel,
    };
  }
}
