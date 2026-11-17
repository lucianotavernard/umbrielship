import type { CustomerAddress, CustomerProps } from './customer.entity.js';

export type CustomerSummaryProps = CustomerProps & {
  vesselCount: number;
};

/** A Customer as the list shows it: its own fields and how many Vessels it owns. */
export class CustomerSummary {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
  vesselCount: number;

  private constructor(props: CustomerSummaryProps, id: string) {
    this.id = id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone as string;
    this.address = props.address;
    this.vesselCount = props.vesselCount;
  }

  static create(props: CustomerSummaryProps, id: string) {
    return new CustomerSummary(props, id);
  }
}
