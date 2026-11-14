import { IInspectionAssignmentsRepository } from '@/package/work-order/inspection-assignment/contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignment } from '@/package/work-order/inspection-assignment/inspection-assignment.entity.js';

export class InMemoryInspectionAssignmentsRepository implements IInspectionAssignmentsRepository {
  public items: InspectionAssignment[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionAssignment | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<InspectionAssignment[]> {
    return this.of(organizationId)
      .filter((item) => item.workOrderId === workOrderId)
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() ||
          b.id.localeCompare(a.id),
      );
  }

  async create(assignment: InspectionAssignment): Promise<void> {
    this.items.push(assignment);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (item) => !(item.organizationId === organizationId && item.id === id),
    );
  }
}
