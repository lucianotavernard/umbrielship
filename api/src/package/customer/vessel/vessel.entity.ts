import { randomUUID } from 'crypto';

export const VESSEL_TYPES = [
  'CARGO',
  'TANKER',
  'PASSENGER',
  'FISHING',
  'BULK_CARRIER',
  'CONTAINER',
  'OTHER',
] as const;

export type VesselType = (typeof VESSEL_TYPES)[number];

export type VesselProps = {
  organizationId: string;
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;
};

export class Vessel {
  id: string;
  organizationId: string;
  name: string;
  type: VesselType;
  length: number;
  imoNumber: string;
  customerId: string;

  private constructor(props: VesselProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.type = props.type;
    this.length = props.length;
    this.imoNumber = props.imoNumber;
    this.customerId = props.customerId;
  }

  static create(props: VesselProps, id?: string) {
    return new Vessel(props, id);
  }
}
