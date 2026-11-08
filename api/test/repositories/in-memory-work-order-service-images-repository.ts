import { WorkOrderServiceImage } from '@/package/work-order/work-order-service-image/work-order-service-image.entity';
import { IWorkOrderServiceImagesRepository } from '@/package/work-order/work-order-service-image/contracts/work-order-service-image-repository.contract';

export class InMemoryWorkOrderServiceImagesRepository implements IWorkOrderServiceImagesRepository {
  public items: WorkOrderServiceImage[] = [];

  async findById(id: string): Promise<WorkOrderServiceImage | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findManyByServiceId(
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]> {
    return this.items.filter((item) => item.serviceId === serviceId);
  }

  async create(image: WorkOrderServiceImage): Promise<void> {
    this.items.push(image);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
