import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import { WorkOrderStatus } from '../work-order/work-order.entity.js';
import { WorkOrderServiceStatus } from './work-order-service.entity.js';

export type Assignee = { staffId?: string | null; teamId?: string | null };

/** The Staff and Teams named must be of the Organization (404 otherwise). */
export async function assertAssigneesExist(
  workforce: WorkforceFacade,
  organizationId: string,
  assignees: Assignee[],
): Promise<void> {
  for (const { staffId, teamId } of assignees) {
    if (staffId && !(await workforce.findStaffById(organizationId, staffId))) {
      throw new NotFoundDomainException('Staff not found');
    }

    if (teamId && !(await workforce.findTeamById(organizationId, teamId))) {
      throw new NotFoundDomainException('Team not found');
    }
  }
}

/**
 * A new Responsável is accepted only while the WorkOrder is PENDING or IN_PROGRESS and the
 * service is not COMPLETED (AD-068); clearing one is always allowed.
 */
export function assertOpenForAssignee(
  workOrderStatus: WorkOrderStatus,
  serviceStatus: WorkOrderServiceStatus,
): void {
  const workOrderOpen =
    workOrderStatus === 'PENDING' || workOrderStatus === 'IN_PROGRESS';

  if (!workOrderOpen || serviceStatus === 'COMPLETED') {
    throw new ConflictDomainException('Work order service is not open');
  }
}
