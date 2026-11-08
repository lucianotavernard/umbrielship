import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { WorkOrderDetail } from './work-order-detail.entity';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';

type GetWorkOrderByIdUseCaseRequest = {
  id: string;
};

type GetWorkOrderByIdUseCaseResponse = {
  workOrder: WorkOrderDetail;
};

@Injectable()
export class GetWorkOrderByIdUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({
    id,
  }: GetWorkOrderByIdUseCaseRequest): Promise<GetWorkOrderByIdUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    return { workOrder };
  }
}
