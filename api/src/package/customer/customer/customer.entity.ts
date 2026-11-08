import { randomUUID } from 'crypto';

export type CustomerAddress = {
  address: string;
  city: string;
  state: string;
};

export type CustomerProps = {
  organizationId: string;
  name: string;
  email: string;
  phone?: string | null;
  address: CustomerAddress;
};

export class Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;

  private constructor(props: CustomerProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone as string;
    this.address = props.address;
  }

  static create(props: CustomerProps, id?: string) {
    return new Customer(props, id);
  }
}
