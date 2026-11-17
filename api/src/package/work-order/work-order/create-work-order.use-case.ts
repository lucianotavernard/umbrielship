import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { WorkOrderService } from '../work-order-service/work-order-service.entity.js';
import { WorkOrder, WorkOrderStatus } from './work-order.entity.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';
import { CustomerFacade } from '@/package/customer/customer.facade.js';

type CreateWorkOrderUseCaseRequest = {
  organizationId: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  services?: { name: string; description: string }[];
};

type CreateWorkOrderUseCaseResponse = {
  workOrder: WorkOrder;
};

@Injectable()
export class CreateWorkOrderUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly customerFacade: CustomerFacade,
  ) {}

  async handle({
    organizationId,
    vesselId,
    startDate,
    endDate,
    status,
    services = [],
  }: CreateWorkOrderUseCaseRequest): Promise<CreateWorkOrderUseCaseResponse> {
    const vessel = await this.customerFacade.findVesselById(
      organizationId,
      vesselId,
    );

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    const workOrder = WorkOrder.create({
      organizationId,
      vesselId,
      startDate,
      endDate,
      status,
    });

    // Each service starts PENDING over the WorkOrder's period.
    const workOrderServices = services.map(({ name, description }) =>
      WorkOrderService.create({
        organizationId,
        workOrderId: workOrder.id,
        name,
        description,
        startDate,
        endDate,
        status: 'PENDING',
      }),
    );

    await this.workOrdersRepository.create(workOrder, workOrderServices);

    return { workOrder };
  }
}
