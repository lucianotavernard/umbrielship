import { randomUUID } from 'crypto';

import { Customer } from '../customer/customer.entity';
import type { VesselProps } from './vessel.entity';

export type VesselDetailProps = VesselProps & {
  customer: Customer;
};

export class VesselDetail {
  id: string;
  name: string;
  type: VesselProps['type'];
  length: number;
  imoNumber: string;
  customerId: string;
  customer: Customer;

  private constructor(props: VesselDetailProps, id?: string) {
    this.id = id ?? randomUUID();
    this.name = props.name;
    this.type = props.type;
    this.length = props.length;
    this.imoNumber = props.imoNumber;
    this.customerId = props.customerId;
    this.customer = props.customer;
  }

  static create(props: VesselDetailProps, id?: string) {
    return new VesselDetail(props, id);
  }
}
