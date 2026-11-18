import { numericDateTime } from '../../work-order/work-order/work-order-filters';
import { WorkOrder, workOrderCode } from '../../work-order/work-order/work-order.service';
import { Assignment, Staff } from './staff.service';

/** One open WorkOrderService the Staff answers for, as the profile lists it (AD-071). */
export type Allocation = {
  workOrderId: string;
  serviceName: string;
  code: string;
  vesselName: string;
  period: string;
  startsAt: number;
};

/**
 * The WorkOrderServices whose Assignment names the Staff or its Team, while the WorkOrder is
 * `PENDING` or `IN_PROGRESS` and the service is not `COMPLETED`, by the service's start.
 */
export function openAllocations(
  staff: Pick<Staff, 'id' | 'teamId'>,
  assignments: Assignment[],
  workOrders: WorkOrder[],
  vesselNames: ReadonlyMap<string, string>,
): Allocation[] {
  const mine = new Set(
    assignments
      .filter(
        (assignment) =>
          (assignment.staffId !== null && assignment.staffId === staff.id) ||
          (staff.teamId !== null && assignment.teamId === staff.teamId),
      )
      .map((assignment) => assignment.workOrderServiceId),
  );

  return workOrders
    .filter((order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS')
    .flatMap((order) =>
      order.services
        .filter((service) => service.status !== 'COMPLETED' && mine.has(service.id))
        .map((service) => ({
          workOrderId: order.id,
          serviceName: service.name,
          code: workOrderCode(order.id),
          vesselName: vesselNames.get(order.vesselId) ?? '',
          period: `${numericDateTime(service.startDate)} – ${numericDateTime(service.endDate)}`,
          startsAt: new Date(service.startDate).getTime(),
        })),
    )
    .sort((a, b) => a.startsAt - b.startsAt);
}
