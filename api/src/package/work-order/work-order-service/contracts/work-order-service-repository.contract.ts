import { WorkOrderService } from '../work-order-service.entity.js';

export abstract class IWorkOrderServicesRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrderService | null>;
  abstract findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<WorkOrderService[]>;
  abstract create(service: WorkOrderService): Promise<void>;
  abstract save(service: WorkOrderService): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
