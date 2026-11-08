import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';

type DeleteWorkOrderUseCaseRequest = {
  id: string;
};

@Injectable()
export class DeleteWorkOrderUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({ id }: DeleteWorkOrderUseCaseRequest): Promise<void> {
    const workOrder = await this.workOrdersRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    await this.workOrdersRepository.delete(id);
  }
}
