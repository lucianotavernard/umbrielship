import { IInspectionAssignmentsRepository } from '@/package/work-order/inspection-assignment/contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignment } from '@/package/work-order/inspection-assignment/inspection-assignment.entity.js';

import type { InMemoryInspectionsRepository } from './in-memory-inspections-repository.js';

export class InMemoryInspectionAssignmentsRepository implements IInspectionAssignmentsRepository {
  public items: InspectionAssignment[] = [];
  // Set by an InMemoryInspectionsRepository built on this one, to read the Inspections as the database does.
  public inspections?: InMemoryInspectionsRepository;

  // Visible Inspections newest first, and the count of every Inspection, as the Prisma read gives them.
  private read(assignment: InspectionAssignment) {
    const all = (this.inspections?.items ?? []).filter(
      (inspection) => inspection.assignmentId === assignment.id,
    );
    assignment.inspectionCount = all.length;
    assignment.inspections = all
      .filter((inspection) => !inspection.discarded)
      .sort(
        (a, b) =>
          b.completedAt.getTime() - a.completedAt.getTime() ||
          b.id.localeCompare(a.id),
      );
    return assignment;
  }

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionAssignment | null> {
    const found = this.of(organizationId).find((item) => item.id === id);
    return found ? this.read(found) : null;
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
      )
      .map((assignment) => this.read(assignment));
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
