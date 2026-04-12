import { randomUUID } from 'crypto';

export enum WorkOrderStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type WorkOrderStatus = `${WorkOrderStatusEnum}`;

export type WorkOrderEntityProps = {
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
};

export class WorkOrderEntity {
  id: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;

  constructor(props: WorkOrderEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
