import { WorkOrderServiceImage } from '@/package/work-order/work-order-service-image/work-order-service-image.entity.js';
import { IWorkOrderServiceImagesRepository } from '@/package/work-order/work-order-service-image/contracts/work-order-service-image-repository.contract.js';

export class InMemoryWorkOrderServiceImagesRepository implements IWorkOrderServiceImagesRepository {
  public items: WorkOrderServiceImage[] = [];

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrderServiceImage | null> {
    return (
      this.items.find(
        (item) => item.id === id && item.organizationId === organizationId,
      ) ?? null
    );
  }

  async findManyByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]> {
    return this.items.filter(
      (item) =>
        item.serviceId === serviceId && item.organizationId === organizationId,
    );
  }

  async create(image: WorkOrderServiceImage): Promise<void> {
    this.items.push(image);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
