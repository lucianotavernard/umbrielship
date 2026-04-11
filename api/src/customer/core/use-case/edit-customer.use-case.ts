import { Injectable, NotFoundException } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/shared/lib/core/exception/already-exists-domain.exception';

import { CustomerEntity } from '../entity/customer.entity';
import { CustomerRepository } from '../interface/customer.repository';

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
  customer: CustomerEntity;
};

@Injectable()
export class EditCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async handle({
    customerId,
    name,
    email,
    phone,
    address,
  }: EditCustomerUseCaseRequest): Promise<EditCustomerUseCaseResponse> {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const existingCustomer = await this.customerRepository.findByEmail(email);

    if (existingCustomer && existingCustomer.id !== customerId) {
      throw new AlreadyExistsDomainException('Customer already exists');
    }

    customer.name = name;
    customer.email = email;
    customer.phone = phone ?? customer.phone;
    customer.address = address
      ? { ...customer.address, ...address }
      : customer.address;

    await this.customerRepository.save(customer);

    return {
      customer,
    };
  }
}
