import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import type { Role } from '../user/user.service';

export type AuthenticateUserRequest = {
  email: string;
  password: string;
};

export type AuthenticateUserResponse = {
  access_token: string;
};

export type MeOrganization = {
  id: string;
  name: string;
  isInternal: boolean;
  role: Role;
};

export type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    organization: {
      id: string;
      name: string;
      isInternal: boolean;
    };
    organizations: MeOrganization[];
  };
};

const TOKEN_KEY = '@umbriel:access-token';
const ORGANIZATION_SWITCHED_KEY = '@umbriel:organization-switched';
const ORGANIZATION_CHANGED_KEY = '@umbriel:organization-changed';

@Service()
export class AuthenticationService {
  private readonly http = inject(HttpClient);

  isAuthenticated = signal(localStorage.getItem(TOKEN_KEY) !== null);
  activeOrganizationId = signal<string | null>(null);

  // The Role of the active Membership, set by the layout from GET /me.
  role = signal<Role | null>(null);
  // An inspector reads and writes nothing it reads; the API refuses it with 403.
  canWrite = computed(() => this.role() !== 'inspector');

  me() {
    return this.http.get<MeResponse>('/api/me');
  }

  authenticate(request: AuthenticateUserRequest): Observable<AuthenticateUserResponse> {
    return this.http.post<AuthenticateUserResponse>('/api/sessions', request).pipe(
      tap((response) => {
        this.isAuthenticated.set(true);
        this.activeOrganizationId.set(null);
        localStorage.setItem(TOKEN_KEY, response.access_token);
      }),
    );
  }

  switchOrganization(organizationId: string): Observable<void> {
    return this.http.post<void>('/api/organizations/switch', { organizationId }).pipe(
      tap(() => localStorage.setItem(ORGANIZATION_SWITCHED_KEY, String(Date.now()))),
    );
  }

  isOrganizationSwitch(event: StorageEvent) {
    return event.key === ORGANIZATION_SWITCHED_KEY;
  }

  markOrganizationChanged() {
    sessionStorage.setItem(ORGANIZATION_CHANGED_KEY, 'true');
  }

  takeOrganizationChanged() {
    const changed = sessionStorage.getItem(ORGANIZATION_CHANGED_KEY) !== null;
    sessionStorage.removeItem(ORGANIZATION_CHANGED_KEY);
    return changed;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.activeOrganizationId.set(null);
    this.role.set(null);
  }
}
