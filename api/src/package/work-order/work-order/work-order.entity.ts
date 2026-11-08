import { randomUUID } from 'crypto';

export const WORK_ORDER_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export type WorkOrderProps = {
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

export class WorkOrder {
  id: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;

  private constructor(props: WorkOrderProps, id?: string) {
    this.id = id ?? randomUUID();
    this.vesselId = props.vesselId;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.status = props.status;
  }

  static create(props: WorkOrderProps, id?: string) {
    return new WorkOrder(props, id);
  }
}
