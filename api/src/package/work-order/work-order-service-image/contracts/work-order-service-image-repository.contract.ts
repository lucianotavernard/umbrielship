import { WorkOrderServiceImage } from '../work-order-service-image.entity';

export abstract class IWorkOrderServiceImagesRepository {
  abstract findById(id: string): Promise<WorkOrderServiceImage | null>;
  abstract findManyByServiceId(
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]>;
  abstract create(image: WorkOrderServiceImage): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
