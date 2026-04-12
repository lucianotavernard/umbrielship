import { WorkOrderServiceEntity } from '../entity/work-order-service.entity';

export abstract class WorkOrderServiceRepository {
  abstract findById(id: string): Promise<WorkOrderServiceEntity | null>;
  abstract findManyByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderServiceEntity[]>;
  abstract create(service: WorkOrderServiceEntity): Promise<void>;
  abstract save(service: WorkOrderServiceEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
