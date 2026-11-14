import { Inspection } from '../inspection.entity.js';

export abstract class IInspectionsRepository {
  // A visible Inspection only: a discarded one is not found.
  abstract findVisibleById(
    organizationId: string,
    id: string,
  ): Promise<Inspection | null>;
  // Every Inspection, discarded ones included, under a WorkOrder: on its own assignments or its services'.
  abstract countByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<number>;
  // Every Inspection, discarded ones included, of assignments that target the service.
  abstract countByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<number>;
  abstract create(inspection: Inspection): Promise<void>;
  abstract saveDiscard(inspection: Inspection): Promise<void>;
}
