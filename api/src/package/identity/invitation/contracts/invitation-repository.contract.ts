import { Invitation, InvitationDeliveryStatus } from '../invitation.entity.js';

export type InvitationDeliveryRecord = {
  deliveryStatus: InvitationDeliveryStatus;
  deliveryAttempts: number;
  lastDeliveryFailureAt: Date | null;
};

export abstract class IInvitationsRepository {
  abstract findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<Invitation[]>;
  abstract countByOrganization(organizationId: string): Promise<number>;
  abstract findById(id: string): Promise<Invitation | null>;
  abstract findManyByDeliveryStatus(
    deliveryStatus: InvitationDeliveryStatus,
  ): Promise<Invitation[]>;
  abstract findBySecret(secret: string): Promise<Invitation | null>;
  abstract findPending(
    userId: string,
    organizationId: string,
  ): Promise<Invitation | null>;
  abstract save(invitation: Invitation): Promise<void>;
  abstract recordDelivery(
    id: string,
    record: InvitationDeliveryRecord,
  ): Promise<void>;
  // Only a pending Invitation whose delivery is delivered or failed goes back to queued, with no attempts.
  // Returns false and writes nothing otherwise, so of two resends at once only one queues it.
  abstract requeueDelivery(id: string): Promise<boolean>;
  // All or nothing: adds the Membership the Invitation offers and marks it accepted.
  // Throws ConflictDomainException when it is no longer pending or the Membership already exists.
  abstract accept(invitation: Invitation): Promise<void>;
}
