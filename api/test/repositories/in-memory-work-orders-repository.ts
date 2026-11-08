import { Paginate } from '@/package/shared/lib/type/paginate';
import { WorkOrderDetail } from '@/package/work-order/work-order/work-order-detail.entity';
import { WorkOrder } from '@/package/work-order/work-order/work-order.entity';
import { IWorkOrdersRepository } from '@/package/work-order/work-order/contracts/work-order-repository.contract';

import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';

export class InMemoryWorkOrdersRepository implements IWorkOrdersRepository {
  public items: WorkOrder[] = [];

  constructor(private readonly vessels: InMemoryVesselsRepository) {}

  async findById(id: string): Promise<WorkOrderDetail | null> {
    const workOrder = this.items.find((item) => item.id === id);

    if (!workOrder) return null;

    const vessel = this.vessels.items.find(
      (item) => item.id === workOrder.vesselId,
    );

    if (!vessel) {
      throw new Error(`in-memory: vessel ${workOrder.vesselId} is not seeded`);
    }

    return WorkOrderDetail.create(
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

  async findMany(take: number, skip: number): Promise<Paginate<WorkOrder>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async findManyByVesselId(
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const owned = this.items.filter((item) => item.vesselId === vesselId);

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async create(workOrder: WorkOrder): Promise<void> {
    this.items.push(workOrder);
  }

  async save(workOrder: WorkOrder): Promise<void> {
    const index = this.items.findIndex((item) => item.id === workOrder.id);
    if (index >= 0) this.items[index] = workOrder;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
