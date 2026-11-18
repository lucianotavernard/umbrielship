import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

/** A professional of the Organization; not a User (AD-060). */
export type Staff = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  teamId: string | null;
};

export type Team = {
  id: string;
  name: string;
  specialty: string;
};

/** A Team as `GET /api/teams` lists it, with how many Staff it has. */
export type TeamListItem = Team & { staffCount: number };

/** One Staff or one Team answering for one WorkOrderService (AD-076). */
export type Assignment = {
  id: string;
  workOrderId: string;
  workOrderServiceId: string;
  staffId: string | null;
  teamId: string | null;
};

export type StaffRequest = Omit<Staff, 'id'>;
export type TeamRequest = Omit<Team, 'id'>;

export type GetStaffListResponse = { staff: Staff[] };
export type GetStaffResponse = { staff: Staff };
export type GetTeamsResponse = { teams: TeamListItem[] };
export type GetTeamResponse = { team: Team };
export type GetAssignmentsResponse = { assignments: Assignment[] };

@Service()
export class StaffService {
  private readonly http = inject(HttpClient);

  createStaff(request: StaffRequest): Observable<GetStaffResponse> {
    return this.http.post<GetStaffResponse>('/api/staff', request);
  }

  updateStaff(id: string, request: StaffRequest): Observable<GetStaffResponse> {
    return this.http.put<GetStaffResponse>(`/api/staff/${id}`, request);
  }

  deleteStaff(id: string): Observable<void> {
    return this.http.delete<void>(`/api/staff/${id}`);
  }

  createTeam(request: TeamRequest): Observable<GetTeamResponse> {
    return this.http.post<GetTeamResponse>('/api/teams', request);
  }

  updateTeam(id: string, request: TeamRequest): Observable<GetTeamResponse> {
    return this.http.put<GetTeamResponse>(`/api/teams/${id}`, request);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`/api/teams/${id}`);
  }
}
