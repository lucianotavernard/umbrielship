import type { WorkOrder } from '../../work-order/work-order/work-order.service';
import { Assignment, Staff } from './staff.service';

export type WorkforceStatus = 'Em serviço' | 'Disponível';

/**
 * The id of every WorkOrderService `IN_PROGRESS` of an open WorkOrder (`PENDING` or `IN_PROGRESS`):
 * a service left in progress on a closed WorkOrder is not work being done (AD-084).
 */
export function servicesInProgress(workOrders: Pick<WorkOrder, 'services' | 'status'>[]): Set<string> {
  return new Set(
    workOrders
      .filter((order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS')
      .flatMap((order) =>
        order.services.filter((service) => service.status === 'IN_PROGRESS').map((service) => service.id),
      ),
  );
}

/**
 * "Em serviço" while the Staff's own Assignment, or its Team's, is on a WorkOrderService that
 * `servicesInProgress` keeps; "Disponível" otherwise (AD-084).
 */
export function staffStatus(
  staff: Pick<Staff, 'id' | 'teamId'>,
  assignments: Assignment[],
  inProgress: ReadonlySet<string>,
): WorkforceStatus {
  const busy = assignments.some(
    (assignment) =>
      inProgress.has(assignment.workOrderServiceId) &&
      ((assignment.staffId !== null && assignment.staffId === staff.id) ||
        (staff.teamId !== null && assignment.teamId === staff.teamId)),
  );
  return busy ? 'Em serviço' : 'Disponível';
}

/** "Em serviço" while the Team's own Assignment is on a WorkOrderService that `servicesInProgress` keeps (AD-084). */
export function teamStatus(
  teamId: string,
  assignments: Assignment[],
  inProgress: ReadonlySet<string>,
): WorkforceStatus {
  const busy = assignments.some(
    (assignment) => assignment.teamId === teamId && inProgress.has(assignment.workOrderServiceId),
  );
  return busy ? 'Em serviço' : 'Disponível';
}

/** The mareos status pills: in service amber, available green. */
export const statusTones: Record<WorkforceStatus, string> = {
  'Em serviço': 'bg-[#fdf3e6] text-[#b9782d] dark:bg-[#30291f] dark:text-[#e2c18b]',
  Disponível: 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]',
};
