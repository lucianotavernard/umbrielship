import { WorkOrderServiceImage } from '../work-order-service-image.entity.js';

export abstract class IWorkOrderServiceImagesRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrderServiceImage | null>;
  abstract findManyByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]>;
  abstract create(image: WorkOrderServiceImage): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
