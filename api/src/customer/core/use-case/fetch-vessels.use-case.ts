import { Injectable } from '@nestjs/common';

import { VesselEntity } from '../entity/vessel.entity';
import { VesselRepository } from '../interface/vessel.repository';

type FetchVesselsUseCaseRequest = {
  customerId?: string;
  skip: number;
  take: number;
};

type FetchVesselsUseCaseResponse = {
  vessels: VesselEntity[];
  total: number;
};

@Injectable()
export class FetchVesselsUseCase {
  constructor(private vesselRepository: VesselRepository) {}

  async handle({
    customerId,
    take,
    skip,
  }: FetchVesselsUseCaseRequest): Promise<FetchVesselsUseCaseResponse> {
    if (customerId) {
      const { data: vessels, total } =
        await this.vesselRepository.findManyByCustomerId(
          customerId,
          take,
          skip,
        );

      return {
        vessels,
        total,
      };
    }

    const { data: vessels, total } = await this.vesselRepository.findMany(
      take,
      skip,
    );

    return {
      vessels,
      total,
    };
  }
}
