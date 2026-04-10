import { Injectable } from '@nestjs/common';

import { CustomerEntity } from '../entity/customer.entity';
import { CustomerRepository } from '../interface/customer.repository';

type FetchCustomersUseCaseRequest = {
  skip: number;
  take: number;
};

type FetchCustomersUseCaseResponse = {
  customers: CustomerEntity[];
  total: number;
};

@Injectable()
export class FetchCustomersUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async handle({
    take,
    skip,
  }: FetchCustomersUseCaseRequest): Promise<FetchCustomersUseCaseResponse> {
    const { data: customers, total } = await this.customerRepository.findMany(
      take,
      skip,
    );

    return {
      customers,
      total,
    };
  }
}
