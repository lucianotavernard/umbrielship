import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { IVesselsRepository } from './contracts/vessel-repository.contract';

type DeleteVesselUseCaseRequest = {
  id: string;
};

@Injectable()
export class DeleteVesselUseCase {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async handle({ id }: DeleteVesselUseCaseRequest): Promise<void> {
    const vessel = await this.vesselsRepository.findById(id);

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    await this.vesselsRepository.delete(id);
  }
}
