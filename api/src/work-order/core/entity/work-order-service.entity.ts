import { randomUUID } from 'crypto';

export enum WorkOrderServiceStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type WorkOrderServiceStatus = `${WorkOrderServiceStatusEnum}`;

export type WorkOrderServiceEntityProps = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

export class WorkOrderServiceEntity {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;

  constructor(props: WorkOrderServiceEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
