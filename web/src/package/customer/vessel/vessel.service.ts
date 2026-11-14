import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { Customer } from '../customer/customer.service';

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

export const vesselTypeLabels: Record<VesselType, string> = {
  CARGO: 'Carga',
  TANKER: 'Tanque',
  PASSENGER: 'Passageiro',
  FISHING: 'Pesca',
  BULK_CARRIER: 'Graneleiro',
  CONTAINER: 'Contêiner',
  OTHER: 'Outro',
};

export type Vessel = {
  id: string;
  imoNumber: string;
  name: string;
  type: VesselType;
  length: number;
  customerId: string;
  customer?: Customer;
};

export type CreateVesselRequest = {
  customerId: string;
  imoNumber: string;
  name: string;
  type: VesselType;
  length: number;
};

export type UpdateVesselRequest = {
  customerId: string;
  name: string;
  type: VesselType;
  length: number;
};

export type GetVesselsResponse = {
  vessels: Vessel[];
  total: number;
};

export type GetVesselResponse = {
  vessel: Vessel;
};

@Service()
export class VesselService {
  private readonly http = inject(HttpClient);

  createVessel(request: CreateVesselRequest): Observable<GetVesselResponse> {
    return this.http.post<GetVesselResponse>('/api/vessels', request);
  }

  updateVessel(vesselId: string, request: UpdateVesselRequest): Observable<GetVesselResponse> {
    return this.http.put<GetVesselResponse>(
      `/api/customers/${request.customerId}/vessels/${vesselId}`,
      request,
    );
  }

  deleteVessel(id: string): Observable<void> {
    return this.http.delete<void>(`/api/vessels/${id}`);
  }
}
