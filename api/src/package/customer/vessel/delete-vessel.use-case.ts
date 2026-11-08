import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IVesselsRepository } from './contracts/vessel-repository.contract.js';

type DeleteVesselUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteVesselUseCase {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async handle({
    organizationId,
    id,
  }: DeleteVesselUseCaseRequest): Promise<void> {
    const vessel = await this.vesselsRepository.findById(organizationId, id);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    await this.vesselsRepository.delete(id);
  }
}
