import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { CustomerRepository } from '@/customer/core/interface/customer.repository';
import { CustomerEntity } from '@/customer/core/entity/customer.entity';

type GetCustomerByIdUseCaseRequest = {
  id: string;
};

type GetCustomerByIdUseCaseResponse = {
  customer: CustomerEntity;
};

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async handle({
    id,
  }: GetCustomerByIdUseCaseRequest): Promise<GetCustomerByIdUseCaseResponse> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    return {
      customer,
    };
  }
}
