import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { ICustomersRepository } from './contracts/customer-repository.contract';
import { Customer } from './customer.entity';

type GetCustomerByIdUseCaseRequest = {
  organizationId: string;
  id: string;
};

type GetCustomerByIdUseCaseResponse = {
  customer: Customer;
};

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(private customersRepository: ICustomersRepository) {}

  async handle({
    organizationId,
    id,
  }: GetCustomerByIdUseCaseRequest): Promise<GetCustomerByIdUseCaseResponse> {
    const customer = await this.customersRepository.findById(
      organizationId,
      id,
    );

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    return {
      customer,
    };
  }
}
