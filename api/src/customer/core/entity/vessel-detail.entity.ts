import { randomUUID } from 'crypto';

import { VesselType } from '@/shared/module/prisma/generated/prisma/enums';
import { CustomerEntity } from './customer.entity';

export type VesselDetailEntityProps = {
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;
  customer: CustomerEntity;
};

export class VesselDetailEntity {
  id: string;
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;
  customer: CustomerEntity;

  constructor(props: VesselDetailEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
