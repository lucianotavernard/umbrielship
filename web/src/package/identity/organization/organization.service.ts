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

/** A member the list names: up to four per Organization, by name (AD-111). */
export type OrganizationMember = {
  id: string;
  name: string;
};

export type OrganizationListItem = Organization & {
  members: OrganizationMember[];
  memberCount: number;
};

export type GetOrganizationsResponse = {
  organizations: OrganizationListItem[];
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

  /** Answers 409 for the internal Organization and for one that still holds records (AD-110). */
  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`/api/organizations/${id}`);
  }
}
