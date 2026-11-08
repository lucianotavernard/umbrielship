import { randomUUID } from 'crypto';

import type { WorkOrderStatus } from './work-order.entity.js';

type VesselValueObject = {
  vesselId: string;
  name: string;
  type: string;
  length: number;
};

export type WorkOrderDetailProps = {
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  vessel: VesselValueObject;
};

export class WorkOrderDetail {
  id: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  vessel: VesselValueObject;

  private constructor(props: WorkOrderDetailProps, id?: string) {
    this.id = id ?? randomUUID();
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.status = props.status;
    this.vessel = props.vessel;
  }

  static create(props: WorkOrderDetailProps, id?: string) {
    return new WorkOrderDetail(props, id);
  }
}
