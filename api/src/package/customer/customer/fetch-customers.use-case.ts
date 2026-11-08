import { Injectable } from '@nestjs/common';

import { Customer } from './customer.entity';
import { ICustomersRepository } from './contracts/customer-repository.contract';

type FetchCustomersUseCaseRequest = {
  skip: number;
  take: number;
};

type FetchCustomersUseCaseResponse = {
  customers: Customer[];
  total: number;
};

@Injectable()
export class FetchCustomersUseCase {
  constructor(private customersRepository: ICustomersRepository) {}

  async handle({
    take,
    skip,
  }: FetchCustomersUseCaseRequest): Promise<FetchCustomersUseCaseResponse> {
    const { data: customers, total } = await this.customersRepository.findMany(
      take,
      skip,
    );

    return {
      customers,
      total,
    };
  }
}
