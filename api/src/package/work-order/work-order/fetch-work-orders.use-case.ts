import { Injectable } from '@nestjs/common';

import { WorkOrder } from './work-order.entity';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';

type FetchWorkOrdersUseCaseRequest = {
  vesselId?: string;
  take: number;
  skip: number;
};

type FetchWorkOrdersUseCaseResponse = {
  workOrders: WorkOrder[];
  total: number;
};

@Injectable()
export class FetchWorkOrdersUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({
    vesselId,
    take,
    skip,
  }: FetchWorkOrdersUseCaseRequest): Promise<FetchWorkOrdersUseCaseResponse> {
    if (vesselId) {
      const { data: workOrders, total } =
        await this.workOrdersRepository.findManyByVesselId(
          vesselId,
          take,
          skip,
        );

      return { workOrders, total };
    }

    const { data: workOrders, total } =
      await this.workOrdersRepository.findMany(take, skip);

    return { workOrders, total };
  }
}
