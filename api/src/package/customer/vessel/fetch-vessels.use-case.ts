import { Injectable } from '@nestjs/common';

import { Vessel } from './vessel.entity';
import { IVesselsRepository } from './contracts/vessel-repository.contract';

type FetchVesselsUseCaseRequest = {
  organizationId: string;
  customerId?: string;
  skip: number;
  take: number;
};

type FetchVesselsUseCaseResponse = {
  vessels: Vessel[];
  total: number;
};

@Injectable()
export class FetchVesselsUseCase {
  constructor(private vesselsRepository: IVesselsRepository) {}

  async handle({
    organizationId,
    customerId,
    take,
    skip,
  }: FetchVesselsUseCaseRequest): Promise<FetchVesselsUseCaseResponse> {
    if (customerId) {
      const { data: vessels, total } =
        await this.vesselsRepository.findManyByCustomerId(
          organizationId,
          customerId,
          take,
          skip,
        );

      return {
        vessels,
        total,
      };
    }

    const { data: vessels, total } = await this.vesselsRepository.findMany(
      organizationId,
      take,
      skip,
    );

    return {
      vessels,
      total,
    };
  }
}
