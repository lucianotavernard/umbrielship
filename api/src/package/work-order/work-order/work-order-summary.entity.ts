import type { WorkOrderServiceStatus } from '../work-order-service/work-order-service.entity.js';
import type { WorkOrderProps, WorkOrderStatus } from './work-order.entity.js';

export type WorkOrderSummaryService = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

export type WorkOrderSummaryProps = WorkOrderProps & {
  services: WorkOrderSummaryService[];
};

/** A WorkOrder as the list shows it: its own fields and its services by start date, then name. */
export class WorkOrderSummary {
  id: string;
  organizationId: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  services: WorkOrderSummaryService[];

  private constructor(props: WorkOrderSummaryProps, id: string) {
    this.id = id;
    this.organizationId = props.organizationId;
    this.vesselId = props.vesselId;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.status = props.status;
    this.services = props.services;
  }

  static create(props: WorkOrderSummaryProps, id: string) {
    return new WorkOrderSummary(props, id);
  }
}
