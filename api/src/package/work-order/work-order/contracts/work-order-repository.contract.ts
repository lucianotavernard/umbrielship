import { Paginate } from '@/package/shared/lib/type/paginate.js';

import type { WorkOrderService } from '../../work-order-service/work-order-service.entity.js';
import { WorkOrder } from '../work-order.entity.js';
import { WorkOrderSummary } from '../work-order-summary.entity.js';

export abstract class IWorkOrdersRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrder | null>;
  /** Every WorkOrder of the Organization when `take` and `skip` are not given, each with its services. */
  abstract findMany(
    organizationId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>>;
  /** Every WorkOrder of the Vessel when `take` and `skip` are not given, each with its services. */
  abstract findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>>;
  /** Writes the WorkOrder and its services together: all of them or none. */
  abstract create(
    workOrder: WorkOrder,
    services?: WorkOrderService[],
  ): Promise<void>;
  abstract save(workOrder: WorkOrder): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
