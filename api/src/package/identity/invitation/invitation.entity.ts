import { randomUUID } from 'crypto';

import { Role } from '../user/user.entity.js';

export type InvitationStatus = 'pending' | 'accepted';

export type InvitationDeliveryStatus = 'queued' | 'delivered' | 'failed';

export type InvitationProps = {
  userId: string;
  organizationId: string;
  secret: string;
  status: InvitationStatus;
  role: Role;
  createdAt?: Date;
  deliveryStatus?: InvitationDeliveryStatus;
  deliveryAttempts?: number;
  lastDeliveryFailureAt?: Date | null;
};

export class Invitation {
  id: string;
  userId: string;
  organizationId: string;
  secret: string;
  status: InvitationStatus;
  role: Role;
  createdAt: Date;
  deliveryStatus: InvitationDeliveryStatus;
  deliveryAttempts: number;
  lastDeliveryFailureAt: Date | null;

  private constructor(props: InvitationProps, id?: string) {
    this.id = id ?? randomUUID();
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.secret = props.secret;
    this.status = props.status;
    this.role = props.role;
    this.createdAt = props.createdAt ?? new Date();
    this.deliveryStatus = props.deliveryStatus ?? 'queued';
    this.deliveryAttempts = props.deliveryAttempts ?? 0;
    this.lastDeliveryFailureAt = props.lastDeliveryFailureAt ?? null;
  }

  static create(props: InvitationProps, id?: string) {
    return new Invitation(props, id);
  }
}
