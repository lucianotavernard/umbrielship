import { Injectable } from '@nestjs/common';

import { Vessel } from './vessel.entity';
import { IVesselsRepository } from './contracts/vessel-repository.contract';

type FetchVesselsUseCaseRequest = {
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
    customerId,
    take,
    skip,
  }: FetchVesselsUseCaseRequest): Promise<FetchVesselsUseCaseResponse> {
    if (customerId) {
      const { data: vessels, total } =
        await this.vesselsRepository.findManyByCustomerId(
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
      take,
      skip,
    );

    return {
      vessels,
      total,
    };
  }
}
