import { WorkOrderServiceImageEntity } from '../entity/work-order-service-image.entity';

export abstract class WorkOrderServiceImageRepository {
  abstract findById(id: string): Promise<WorkOrderServiceImageEntity | null>;
  abstract findManyByServiceId(
    serviceId: string,
  ): Promise<WorkOrderServiceImageEntity[]>;
  abstract create(image: WorkOrderServiceImageEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
