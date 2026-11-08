import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type Role = 'administrator' | 'operator';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type UserCandidate = {
  id: string;
  name: string;
  email: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId: string;
};

export type GetUsersResponse = {
  users: User[];
  total: number;
};

export type GetUserCandidatesResponse = {
  users: UserCandidate[];
  total: number;
};

export type RoleCount = {
  role: Role;
  users: number;
};

export type GetOrganizationRolesResponse = {
  roles: RoleCount[];
};

export const roleLabels: Record<Role, string> = {
  administrator: 'Administrador',
  operator: 'Operador',
};

@Service()
export class UserService {
  private readonly http = inject(HttpClient);

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>('/api/users', request);
  }
}
