import { Injectable } from '@nestjs/common';

import { CustomerSummary } from './customer-summary.entity.js';
import { ICustomersRepository } from './contracts/customer-repository.contract.js';

type FetchCustomersUseCaseRequest = {
  organizationId: string;
  skip?: number;
  take?: number;
};

type FetchCustomersUseCaseResponse = {
  customers: CustomerSummary[];
  total: number;
};

@Injectable()
export class FetchCustomersUseCase {
  constructor(private customersRepository: ICustomersRepository) {}

  async handle({
    organizationId,
    take,
    skip,
  }: FetchCustomersUseCaseRequest): Promise<FetchCustomersUseCaseResponse> {
    const { data: customers, total } = await this.customersRepository.findMany(
      organizationId,
      take,
      skip,
    );

    return {
      customers,
      total,
    };
  }
}
