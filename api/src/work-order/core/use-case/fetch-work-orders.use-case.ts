import { Injectable } from '@nestjs/common';

import { WorkOrderEntity } from '../entity/work-order.entity';
import { WorkOrderRepository } from '../interface/work-order.repository';

type FetchWorkOrdersUseCaseRequest = {
  vesselId?: string;
  take: number;
  skip: number;
};

type FetchWorkOrdersUseCaseResponse = {
  workOrders: WorkOrderEntity[];
  total: number;
};

@Injectable()
export class FetchWorkOrdersUseCase {
  constructor(private readonly workOrderRepository: WorkOrderRepository) {}

  async handle({
    vesselId,
    take,
    skip,
  }: FetchWorkOrdersUseCaseRequest): Promise<FetchWorkOrdersUseCaseResponse> {
    if (vesselId) {
      const { data: workOrders, total } =
        await this.workOrderRepository.findManyByVesselId(
          vesselId,
          take,
          skip,
        );

      return { workOrders, total };
    }

    const { data: workOrders, total } = await this.workOrderRepository.findMany(
      take,
      skip,
    );

    return { workOrders, total };
  }
}
