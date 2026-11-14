import { InspectionAssignment } from '../inspection-assignment.entity.js';

export abstract class IInspectionAssignmentsRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionAssignment | null>;
  // Newest first, ties by id, with the target service's current name.
  abstract findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<InspectionAssignment[]>;
  abstract create(assignment: InspectionAssignment): Promise<void>;
  abstract delete(organizationId: string, id: string): Promise<void>;
}
