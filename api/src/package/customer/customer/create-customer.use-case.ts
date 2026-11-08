import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';

import { Customer } from './customer.entity';
import { ICustomersRepository } from './contracts/customer-repository.contract';

type CreateCustomerUseCaseRequest = {
  name: string;
  email: string;
  phone?: string | null;
  address: {
    address: string;
    city: string;
    state: string;
  };
};

type CreateCustomerUseCaseResponse = {
  customer: Customer;
};

@Injectable()
export class CreateCustomerUseCase {
  constructor(private customersRepository: ICustomersRepository) {}

  async handle({
    name,
    email,
    phone,
    address,
  }: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
    const existing = await this.customersRepository.findByEmail(email);

    if (existing) {
      throw new AlreadyExistsDomainException('Customer already exists');
    }

    const customer = Customer.create({
      name,
      email,
      phone,
      address,
    });

    await this.customersRepository.create(customer);

    return {
      customer,
    };
  }
}
