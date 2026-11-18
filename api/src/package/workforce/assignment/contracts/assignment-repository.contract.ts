import { Assignment } from '../assignment.entity.js';

export abstract class IAssignmentsRepository {
  abstract findMany(organizationId: string): Promise<Assignment[]>;
  abstract findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<Assignment[]>;
  abstract countByStaffId(
    organizationId: string,
    staffId: string,
  ): Promise<number>;
  abstract countByTeamId(
    organizationId: string,
    teamId: string,
  ): Promise<number>;
  /** Writes the one Assignment of its WorkOrderService, replacing any other. */
  abstract put(assignment: Assignment): Promise<void>;
  abstract deleteByWorkOrderServiceId(
    organizationId: string,
    workOrderServiceId: string,
  ): Promise<void>;
  abstract deleteByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<void>;
}
