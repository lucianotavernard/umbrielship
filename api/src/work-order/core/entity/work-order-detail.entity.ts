import { randomUUID } from 'crypto';

import { WorkOrderServiceImageEntity } from './work-order-service-image.entity';
import { WorkOrderServiceEntity } from './work-order-service.entity';
import { WorkOrderStatus } from './work-order.entity';

export type WorkOrderServiceWithImages = {
  service: WorkOrderServiceEntity;
  images: WorkOrderServiceImageEntity[];
};

export type WorkOrderDetailEntityProps = {
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  services: WorkOrderServiceWithImages[];
};

export class WorkOrderDetailEntity {
  id: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderStatus;
  services: WorkOrderServiceWithImages[];

  constructor(props: WorkOrderDetailEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
