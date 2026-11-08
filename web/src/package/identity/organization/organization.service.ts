import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type Organization = {
  id: string;
  name: string;
  email: string;
  isInternal: boolean;
};

export type CreateOrganizationRequest = {
  name: string;
  email: string;
};

export type GetOrganizationsResponse = {
  organizations: Organization[];
  total: number;
};

export type GetOrganizationResponse = {
  organization: Organization;
};

@Service()
export class OrganizationService {
  private readonly http = inject(HttpClient);

  createOrganization(request: CreateOrganizationRequest): Observable<Organization> {
    return this.http.post<Organization>('/api/organizations', request);
  }
}
