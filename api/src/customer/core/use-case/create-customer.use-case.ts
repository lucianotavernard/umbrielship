import { Injectable } from '@nestjs/common';

import { CustomerEntity } from '../entity/customer.entity';
import { CustomerAlreadyExistException } from '../exception/customer-already-exists.exception';
import { CustomerRepository } from '../interface/customer.repository';

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
  customer: CustomerEntity;
};

@Injectable()
export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async handle({
    name,
    email,
    phone,
    address,
  }: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
    let customer = await this.customerRepository.findByEmail(email);

    if (customer) {
      throw new CustomerAlreadyExistException();
    }

    customer = new CustomerEntity({
      name,
      email,
      phone,
      address,
    });

    await this.customerRepository.create(customer);

    return {
      customer,
    };
  }
}
