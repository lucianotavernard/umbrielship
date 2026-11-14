import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IVesselsRepository } from '../vessel/contracts/vessel-repository.contract.js';
import { ICustomersRepository } from './contracts/customer-repository.contract.js';

type DeleteCustomerUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    private customersRepository: ICustomersRepository,
    private vesselsRepository: IVesselsRepository,
  ) {}

  async handle({
    organizationId,
    id,
  }: DeleteCustomerUseCaseRequest): Promise<void> {
    const customer = await this.customersRepository.findById(
      organizationId,
      id,
    );

    if (!customer) {
      throw new NotFoundDomainException('Customer not found');
    }

    const vessels = await this.vesselsRepository.findManyByCustomerId(
      organizationId,
      id,
      1,
      0,
    );

    if (vessels.total > 0) {
      throw new ConflictDomainException('Customer in use');
    }

    await this.customersRepository.delete(organizationId, id);
  }
}
