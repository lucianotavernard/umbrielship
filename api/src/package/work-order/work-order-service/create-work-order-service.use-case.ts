import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import {
  WorkOrderService,
  WorkOrderServiceStatus,
} from './work-order-service.entity.js';
import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract.js';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract.js';
import { assertAssigneesExist, assertOpenForAssignee } from './assignee.js';

type CreateWorkOrderServiceUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
  staffId?: string | null;
  teamId?: string | null;
};

type CreateWorkOrderServiceUseCaseResponse = {
  service: WorkOrderService;
};

@Injectable()
export class CreateWorkOrderServiceUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly workforceFacade: WorkforceFacade,
  ) {}

  async handle(
    input: CreateWorkOrderServiceUseCaseRequest,
  ): Promise<CreateWorkOrderServiceUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      input.organizationId,
      input.workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    const assigned = Boolean(input.staffId || input.teamId);
    await assertAssigneesExist(this.workforceFacade, input.organizationId, [
      input,
    ]);
    if (assigned) {
      assertOpenForAssignee(workOrder.status, input.status);
    }

    const service = WorkOrderService.create({
      organizationId: input.organizationId,
      workOrderId: input.workOrderId,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
    });

    await this.workOrderServicesRepository.create(service);

    if (assigned) {
      await this.workforceFacade.assign(input.organizationId, {
        workOrderId: input.workOrderId,
        workOrderServiceId: service.id,
        staffId: input.staffId ?? null,
        teamId: input.teamId ?? null,
      });
    }

    return { service };
  }
}
