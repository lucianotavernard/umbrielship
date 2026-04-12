import { Paginate } from '@/shared/lib/core/type/paginate';

import { WorkOrderDetailEntity } from '../entity/work-order-detail.entity';
import { WorkOrderEntity } from '../entity/work-order.entity';

export abstract class WorkOrderRepository {
  abstract findById(id: string): Promise<WorkOrderDetailEntity | null>;
  abstract findMany(
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrderEntity>>;
  abstract findManyByVesselId(
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrderEntity>>;
  abstract create(workOrder: WorkOrderEntity): Promise<void>;
  abstract save(workOrder: WorkOrderEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
