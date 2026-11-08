import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { WorkOrder } from '../work-order.entity.js';

export abstract class IWorkOrdersRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrder | null>;
  abstract findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>>;
  abstract findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>>;
  abstract create(workOrder: WorkOrder): Promise<void>;
  abstract save(workOrder: WorkOrder): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
