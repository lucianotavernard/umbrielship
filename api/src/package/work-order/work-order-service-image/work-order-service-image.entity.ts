import { randomUUID } from 'crypto';

export type WorkOrderServiceImageProps = {
  organizationId: string;
  serviceId: string;
  url: string;
};

export class WorkOrderServiceImage {
  id: string;
  organizationId: string;
  serviceId: string;
  url: string;

  private constructor(props: WorkOrderServiceImageProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.serviceId = props.serviceId;
    this.url = props.url;
  }

  static create(props: WorkOrderServiceImageProps, id?: string) {
    return new WorkOrderServiceImage(props, id);
  }
}
