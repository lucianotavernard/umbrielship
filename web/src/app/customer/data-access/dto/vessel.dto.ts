import { CustomerDto } from "./customer.dto";

export type VesselDto = {
  id: string;
  imoNumber: string;
  name: string;
  type: string;
  length: number;
  customerId: string;
  customer: CustomerDto;
}

export type VesselResponseDto = {
  vessel: VesselDto;
};

export type VesselsResponseDto = {
  vessels: VesselDto[];
  total: number;
};