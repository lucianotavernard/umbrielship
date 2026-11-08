import { WorkOrderService } from '../work-order-service.entity';

export abstract class IWorkOrderServicesRepository {
  abstract findById(id: string): Promise<WorkOrderService | null>;
  abstract findManyByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderService[]>;
  abstract create(service: WorkOrderService): Promise<void>;
  abstract save(service: WorkOrderService): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
