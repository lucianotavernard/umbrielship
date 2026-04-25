import { randomUUID } from 'crypto';

import { WorkOrderStatus } from './work-order.entity';

type VesselValueObject = {
  vesselId: string;
  name: string;
  type: string;
  length: number;
};

export type WorkOrderDetailEntityProps = {
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  vessel: VesselValueObject;
};

export class WorkOrderDetailEntity {
  id: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  vessel: VesselValueObject;

  constructor(props: WorkOrderDetailEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
