import { randomUUID } from 'crypto';

export enum VesselTypeEnum {
  CARGO = 'CARGO',
  TANKER = 'TANKER',
  PASSENGER = 'PASSENGER',
  FISHING = 'FISHING',
  BULK_CARRIER = 'BULK_CARRIER',
  CONTAINER = 'CONTAINER',
  OTHER = 'OTHER',
}

export type VesselType = `${VesselTypeEnum}`;

export type VesselEntityProps = {
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;
};

export class VesselEntity {
  id: string;
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;

  constructor(props: VesselEntityProps, id?: string) {
    Object.assign(this, props);
    this.id = id ?? randomUUID();
  }
}
