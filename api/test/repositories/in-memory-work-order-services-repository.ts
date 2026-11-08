import { WorkOrderService } from '@/package/work-order/work-order-service/work-order-service.entity.js';
import { IWorkOrderServicesRepository } from '@/package/work-order/work-order-service/contracts/work-order-service-repository.contract.js';

export class InMemoryWorkOrderServicesRepository implements IWorkOrderServicesRepository {
  public items: WorkOrderService[] = [];

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrderService | null> {
    return (
      this.items.find(
        (item) => item.id === id && item.organizationId === organizationId,
      ) ?? null
    );
  }

  async findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<WorkOrderService[]> {
    return this.items.filter(
      (item) =>
        item.workOrderId === workOrderId &&
        item.organizationId === organizationId,
    );
  }

  async create(service: WorkOrderService): Promise<void> {
    this.items.push(service);
  }

  async save(service: WorkOrderService): Promise<void> {
    const index = this.items.findIndex((item) => item.id === service.id);
    if (index >= 0) this.items[index] = service;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
