import { Paginate } from '@/package/shared/lib/type/paginate';

import { WorkOrderDetail } from '../work-order-detail.entity';
import { WorkOrder } from '../work-order.entity';

export abstract class IWorkOrdersRepository {
  abstract findById(id: string): Promise<WorkOrderDetail | null>;
  abstract findMany(take: number, skip: number): Promise<Paginate<WorkOrder>>;
  abstract findManyByVesselId(
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>>;
  abstract create(workOrder: WorkOrder): Promise<void>;
  abstract save(workOrder: WorkOrder): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
