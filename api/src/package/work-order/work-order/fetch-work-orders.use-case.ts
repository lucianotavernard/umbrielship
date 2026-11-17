import { Injectable } from '@nestjs/common';

import { WorkOrderSummary } from './work-order-summary.entity.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

type FetchWorkOrdersUseCaseRequest = {
  organizationId: string;
  vesselId?: string;
  // Neither given: every WorkOrder.
  take?: number;
  skip?: number;
};

type FetchWorkOrdersUseCaseResponse = {
  workOrders: WorkOrderSummary[];
  total: number;
};

@Injectable()
export class FetchWorkOrdersUseCase {
  constructor(private readonly workOrdersRepository: IWorkOrdersRepository) {}

  async handle({
    organizationId,
    vesselId,
    take,
    skip,
  }: FetchWorkOrdersUseCaseRequest): Promise<FetchWorkOrdersUseCaseResponse> {
    if (vesselId) {
      const { data: workOrders, total } =
        await this.workOrdersRepository.findManyByVesselId(
          organizationId,
          vesselId,
          take,
          skip,
        );

      return { workOrders, total };
    }

    const { data: workOrders, total } =
      await this.workOrdersRepository.findMany(organizationId, take, skip);

    return { workOrders, total };
  }
}
