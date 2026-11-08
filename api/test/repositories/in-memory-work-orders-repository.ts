import { Paginate } from '@/shared/lib/core/type/paginate';
import { WorkOrderDetailEntity } from '@/work-order/core/entity/work-order-detail.entity';
import { WorkOrderEntity } from '@/work-order/core/entity/work-order.entity';
import { WorkOrderRepository } from '@/work-order/core/interface/work-order.repository';

import { InMemoryVesselsRepository } from './in-memory-vessels-repository';

export class InMemoryWorkOrdersRepository implements WorkOrderRepository {
  public items: WorkOrderEntity[] = [];

  constructor(private readonly vessels: InMemoryVesselsRepository) {}

  async findById(id: string): Promise<WorkOrderDetailEntity | null> {
    const workOrder = this.items.find((item) => item.id === id);

    if (!workOrder) return null;

    const vessel = this.vessels.items.find(
      (item) => item.id === workOrder.vesselId,
    );

    if (!vessel) {
      throw new Error(`in-memory: vessel ${workOrder.vesselId} is not seeded`);
    }

    return new WorkOrderDetailEntity(
      {
        startDate: workOrder.startDate,
        endDate: workOrder.endDate,
        status: workOrder.status,
        vessel: {
          vesselId: vessel.id,
          name: vessel.name,
          type: vessel.type,
          length: vessel.length,
        },
      },
      workOrder.id,
    );
  }

  async findMany(
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrderEntity>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async findManyByVesselId(
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrderEntity>> {
    const owned = this.items.filter((item) => item.vesselId === vesselId);

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async create(workOrder: WorkOrderEntity): Promise<void> {
    this.items.push(workOrder);
  }

  async save(workOrder: WorkOrderEntity): Promise<void> {
    const index = this.items.findIndex((item) => item.id === workOrder.id);
    if (index >= 0) this.items[index] = workOrder;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
