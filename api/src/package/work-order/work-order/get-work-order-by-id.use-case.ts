import { Injectable } from '@nestjs/common';

import { CustomerFacade } from '@/package/customer/customer.facade';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';
import { WorkOrderDetail } from './work-order-detail.entity';

type GetWorkOrderByIdUseCaseRequest = {
  organizationId: string;
  id: string;
};

type GetWorkOrderByIdUseCaseResponse = {
  workOrder: WorkOrderDetail;
};

@Injectable()
export class GetWorkOrderByIdUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly customerFacade: CustomerFacade,
  ) {}

  async handle({
    organizationId,
    id,
  }: GetWorkOrderByIdUseCaseRequest): Promise<GetWorkOrderByIdUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      id,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const vessel = await this.customerFacade.findVesselById(
      organizationId,
      workOrder.vesselId,
    );

    if (!vessel) {
      throw new NotFoundDomainException('Vessel not found');
    }

    return {
      workOrder: WorkOrderDetail.create(
        {
          startDate: workOrder.startDate,
          endDate: workOrder.endDate,
          status: workOrder.status,
          vessel: {
            vesselId: vessel.id,
            name: vessel.name,
            type: vessel.type,
            length: vessel.length,
          },
        },
        workOrder.id,
      ),
    };
  }
}
