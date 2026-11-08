import { WorkOrderServiceImageEntity } from '@/work-order/core/entity/work-order-service-image.entity';
import { WorkOrderServiceImageRepository } from '@/work-order/core/interface/work-order-service-image.repository';

export class InMemoryWorkOrderServiceImagesRepository implements WorkOrderServiceImageRepository {
  public items: WorkOrderServiceImageEntity[] = [];

  async findById(id: string): Promise<WorkOrderServiceImageEntity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findManyByServiceId(
    serviceId: string,
  ): Promise<WorkOrderServiceImageEntity[]> {
    return this.items.filter((item) => item.serviceId === serviceId);
  }

  async create(image: WorkOrderServiceImageEntity): Promise<void> {
    this.items.push(image);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
