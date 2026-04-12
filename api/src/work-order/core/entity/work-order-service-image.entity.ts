import { randomUUID } from 'crypto';

export type WorkOrderServiceImageEntityProps = {
  serviceId: string;
  url: string;
};

export class WorkOrderServiceImageEntity {
  id: string;
  serviceId: string;
  url: string;

  constructor(props: WorkOrderServiceImageEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
