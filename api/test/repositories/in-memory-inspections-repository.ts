import { IInspectionsRepository } from '@/package/work-order/inspection/contracts/inspection-repository.contract.js';
import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';

import { InMemoryInspectionAssignmentsRepository } from './in-memory-inspection-assignments-repository.js';

export class InMemoryInspectionsRepository implements IInspectionsRepository {
  public items: Inspection[] = [];

  // The assignments tell which WorkOrder or service an Inspection sits under.
  constructor(
    private readonly assignments = new InMemoryInspectionAssignmentsRepository(),
  ) {
    assignments.inspections = this;
  }

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findVisibleById(
    organizationId: string,
    id: string,
  ): Promise<Inspection | null> {
    return (
      this.of(organizationId).find(
        (item) => item.id === id && !item.discarded,
      ) ?? null
    );
  }

  private under(
    organizationId: string,
    matches: (assignment: {
      workOrderId: string;
      serviceId?: string;
    }) => boolean,
  ) {
    return this.of(organizationId).filter((inspection) => {
      const assignment = this.assignments.items.find(
        (item) => item.id === inspection.assignmentId,
      );
      return (
        assignment !== undefined &&
        matches({
          workOrderId: assignment.workOrderId,
          serviceId: assignment.service?.id,
        })
      );
    }).length;
  }

  async countByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<number> {
    return this.under(
      organizationId,
      (assignment) => assignment.workOrderId === workOrderId,
    );
  }

  async countByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<number> {
    return this.under(
      organizationId,
      (assignment) => assignment.serviceId === serviceId,
    );
  }

  async create(inspection: Inspection): Promise<void> {
    this.items.push(inspection);
  }

  async saveDiscard(inspection: Inspection): Promise<void> {
    const index = this.items.findIndex((item) => item.id === inspection.id);
    this.items[index] = inspection;
  }
}
