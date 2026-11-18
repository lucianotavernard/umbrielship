import { Assignment } from '@/package/workforce/assignment/assignment.entity.js';
import { IAssignmentsRepository } from '@/package/workforce/assignment/contracts/assignment-repository.contract.js';

export class InMemoryAssignmentsRepository implements IAssignmentsRepository {
  public items: Assignment[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findMany(organizationId: string): Promise<Assignment[]> {
    return this.of(organizationId);
  }

  async findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<Assignment[]> {
    return this.of(organizationId).filter(
      (item) => item.workOrderId === workOrderId,
    );
  }

  async countByStaffId(
    organizationId: string,
    staffId: string,
  ): Promise<number> {
    return this.of(organizationId).filter((item) => item.staffId === staffId)
      .length;
  }

  async countByTeamId(organizationId: string, teamId: string): Promise<number> {
    return this.of(organizationId).filter((item) => item.teamId === teamId)
      .length;
  }

  // One row per WorkOrderService, as the unique index keeps it.
  async put(assignment: Assignment): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.workOrderServiceId === assignment.workOrderServiceId,
    );

    if (index === -1) {
      this.items.push(assignment);
      return;
    }

    this.items[index] = Assignment.create(
      {
        organizationId: this.items[index].organizationId,
        workOrderId: this.items[index].workOrderId,
        workOrderServiceId: assignment.workOrderServiceId,
        staffId: assignment.staffId,
        teamId: assignment.teamId,
      },
      this.items[index].id,
    );
  }

  async deleteByWorkOrderServiceId(
    organizationId: string,
    workOrderServiceId: string,
  ): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        !(
          item.organizationId === organizationId &&
          item.workOrderServiceId === workOrderServiceId
        ),
    );
  }

  async deleteByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        !(
          item.organizationId === organizationId &&
          item.workOrderId === workOrderId
        ),
    );
  }
}
