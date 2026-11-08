import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

type DeleteWorkOrderUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteWorkOrderUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({
    organizationId,
    id,
  }: DeleteWorkOrderUseCaseRequest): Promise<void> {
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      id,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    await this.workOrdersRepository.delete(id);
  }
}
