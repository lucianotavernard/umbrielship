import { WorkOrderServiceEntity } from '@/work-order/core/entity/work-order-service.entity';
import { WorkOrderServiceRepository } from '@/work-order/core/interface/work-order-service.repository';

export class InMemoryWorkOrderServicesRepository implements WorkOrderServiceRepository {
  public items: WorkOrderServiceEntity[] = [];

  async findById(id: string): Promise<WorkOrderServiceEntity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findManyByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderServiceEntity[]> {
    return this.items.filter((item) => item.workOrderId === workOrderId);
  }

  async create(service: WorkOrderServiceEntity): Promise<void> {
    this.items.push(service);
  }

  async save(service: WorkOrderServiceEntity): Promise<void> {
    const index = this.items.findIndex((item) => item.id === service.id);
    if (index >= 0) this.items[index] = service;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
