import { randomUUID } from 'crypto';

export type CustomerEntityProps = {
  name: string;
  email: string;
  phone?: string | null;
  address: {
    address: string;
    city: string;
    state: string;
  };
};

export class CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    address: string;
    city: string;
    state: string;
  };

  constructor(props: CustomerEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
