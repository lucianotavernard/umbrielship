import { randomUUID } from 'crypto';

export const WORK_ORDER_SERVICE_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

export type WorkOrderServiceStatus =
  (typeof WORK_ORDER_SERVICE_STATUSES)[number];

export type WorkOrderServiceProps = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

export class WorkOrderService {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;

  private constructor(props: WorkOrderServiceProps, id?: string) {
    this.id = id ?? randomUUID();
    this.workOrderId = props.workOrderId;
    this.name = props.name;
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.status = props.status;
  }

  static create(props: WorkOrderServiceProps, id?: string) {
    return new WorkOrderService(props, id);
  }
}
