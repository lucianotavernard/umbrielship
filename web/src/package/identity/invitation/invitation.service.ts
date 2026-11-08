import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { Role } from '../user/user.service';

export type InvitationStatus = 'pending' | 'accepted';
export type InvitationDeliveryStatus = 'queued' | 'delivered' | 'failed';

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  deliveryStatus: InvitationDeliveryStatus;
};

export type SendInvitationRequest = {
  userId: string;
  organizationId: string;
  role: Role;
};

export type GetInvitationsResponse = {
  invitations: Invitation[];
  total: number;
};

export type AcceptInvitationResponse = {
  organizationName: string;
};

export const invitationStatusLabels: Record<InvitationStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
};

export const invitationDeliveryStatusLabels: Record<InvitationDeliveryStatus, string> = {
  queued: 'Na fila',
  delivered: 'Entregue',
  failed: 'Falhou',
};

@Service()
export class InvitationService {
  private readonly http = inject(HttpClient);

  sendInvitation(request: SendInvitationRequest): Observable<Invitation> {
    return this.http.post<Invitation>('/api/invitations', request);
  }

  resendInvitation(id: string): Observable<Invitation> {
    return this.http.post<Invitation>(`/api/invitations/${id}/resend`, {});
  }

  acceptInvitation(secret: string): Observable<AcceptInvitationResponse> {
    return this.http.post<AcceptInvitationResponse>('/api/invitations/accept', { secret });
  }
}
