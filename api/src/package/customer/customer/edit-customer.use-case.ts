import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { Customer } from './customer.entity';
import { ICustomersRepository } from './contracts/customer-repository.contract';

type EditCustomerUseCaseRequest = {
  customerId: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: {
    address: string;
    city: string;
    state: string;
  };
};

type EditCustomerUseCaseResponse = {
  customer: Customer;
};

@Injectable()
export class EditCustomerUseCase {
  constructor(private customersRepository: ICustomersRepository) {}

  async handle({
    customerId,
    name,
    email,
    phone,
    address,
  }: EditCustomerUseCaseRequest): Promise<EditCustomerUseCaseResponse> {
    const customer = await this.customersRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    const existingCustomer = await this.customersRepository.findByEmail(email);

    if (existingCustomer && existingCustomer.id !== customerId) {
      throw new AlreadyExistsDomainException('Customer already exists');
    }

    customer.name = name;
    customer.email = email;
    customer.phone = phone ?? customer.phone;
    customer.address = address
      ? { ...customer.address, ...address }
      : customer.address;

    await this.customersRepository.save(customer);

    return {
      customer,
    };
  }
}
