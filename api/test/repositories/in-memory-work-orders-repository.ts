import { Paginate } from '@/package/shared/lib/type/paginate';
import { WorkOrder } from '@/package/work-order/work-order/work-order.entity';
import { IWorkOrdersRepository } from '@/package/work-order/work-order/contracts/work-order-repository.contract';

export class InMemoryWorkOrdersRepository implements IWorkOrdersRepository {
  public items: WorkOrder[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrder | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const owned = this.of(organizationId);

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const owned = this.of(organizationId).filter(
      (item) => item.vesselId === vesselId,
    );

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
