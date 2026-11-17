import type { WorkOrderServiceStatus } from '../work-order-service/work-order-service.entity.js';
import type { WorkOrderStatus } from '../work-order/work-order.entity.js';
import type { InspectionAssignment } from './inspection-assignment.entity.js';

/**
 * An InspectionAssignment as the Organization-wide list shows it: with its WorkOrder and the
 * current status of its target service (null when it inspects the WorkOrder as a whole).
 */
export type InspectionAssignmentSummary = {
  assignment: InspectionAssignment;
  workOrder: { id: string; vesselId: string; status: WorkOrderStatus };
  service: { id: string; name: string; status: WorkOrderServiceStatus } | null;
};
