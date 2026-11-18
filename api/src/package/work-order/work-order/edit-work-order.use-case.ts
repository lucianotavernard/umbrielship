import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';
import {
  assertAssigneesExist,
  assertOpenForAssignee,
} from '../work-order-service/assignee.js';
import { WorkOrder, WorkOrderStatus } from './work-order.entity.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

type EditWorkOrderUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  /** The Responsável of each service listed; neither id clears it; unlisted services keep theirs. */
  services?: { id: string; staffId?: string | null; teamId?: string | null }[];
};

type EditWorkOrderUseCaseResponse = {
  workOrder: WorkOrder;
};

@Injectable()
export class EditWorkOrderUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly workforceFacade: WorkforceFacade,
  ) {}

  async handle({
    organizationId,
    workOrderId,
    startDate,
    endDate,
    status,
    services,
  }: EditWorkOrderUseCaseRequest): Promise<EditWorkOrderUseCaseResponse> {
    const existing = await this.workOrdersRepository.findById(
      organizationId,
      workOrderId,
    );

    if (!existing) {
      throw new NotFoundDomainException('Work order not found');
    }

    const changes = services
      ? await this.planAssignees(organizationId, workOrderId, status, services)
      : [];

    const workOrder = WorkOrder.create(
      {
        organizationId,
        vesselId: existing.vesselId,
        startDate,
        endDate,
        status,
      },
      existing.id,
    );

    await this.workOrdersRepository.save(workOrder);

    for (const change of changes) {
      if (change.staffId || change.teamId) {
        await this.workforceFacade.assign(organizationId, {
          workOrderId,
          workOrderServiceId: change.id,
          staffId: change.staffId,
          teamId: change.teamId,
        });
      } else {
        await this.workforceFacade.unassign(organizationId, change.id);
      }
    }

    return { workOrder };
  }

  // Checks every listed service before anything is written and returns only what changes.
  private async planAssignees(
    organizationId: string,
    workOrderId: string,
    status: WorkOrderStatus,
    services: NonNullable<EditWorkOrderUseCaseRequest['services']>,
  ) {
    const ownServices = new Map(
      (
        await this.workOrderServicesRepository.findManyByWorkOrderId(
          organizationId,
          workOrderId,
        )
      ).map((service) => [service.id, service]),
    );

    for (const { id } of services) {
      if (!ownServices.has(id)) {
        throw new NotFoundDomainException('Work order service not found');
      }
    }

    await assertAssigneesExist(this.workforceFacade, organizationId, services);

    const current = new Map(
      (
        await this.workforceFacade.findAssigneesByWorkOrderId(
          organizationId,
          workOrderId,
        )
      ).map((assignee) => [assignee.workOrderServiceId, assignee]),
    );

    const changes: {
      id: string;
      staffId: string | null;
      teamId: string | null;
    }[] = [];

    for (const item of services) {
      const staffId = item.staffId ?? null;
      const teamId = item.teamId ?? null;
      const now = current.get(item.id);
      const same =
        (now?.staffId ?? null) === staffId && (now?.teamId ?? null) === teamId;

      if (same) continue;

      if (staffId || teamId) {
        assertOpenForAssignee(status, ownServices.get(item.id)!.status);
      }

      changes.push({ id: item.id, staffId, teamId });
    }

    return changes;
  }
}
