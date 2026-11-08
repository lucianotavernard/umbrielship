import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception';
import {
  IInvitationsRepository,
  InvitationDeliveryRecord,
} from '@/package/identity/invitation/contracts/invitation-repository.contract';
import {
  Invitation,
  InvitationDeliveryStatus,
} from '@/package/identity/invitation/invitation.entity';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';

export class InMemoryInvitationsRepository implements IInvitationsRepository {
  public items: Invitation[] = [];

  constructor(private readonly users?: InMemoryUsersRepository) {}

  private ofOrganization(organizationId: string) {
    return this.items
      .filter((item) => item.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ) {
    return this.ofOrganization(organizationId).slice(
      (page - 1) * perPage,
      page * perPage,
    );
  }

  async countByOrganization(organizationId: string) {
    return this.ofOrganization(organizationId).length;
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findManyByDeliveryStatus(deliveryStatus: InvitationDeliveryStatus) {
    return this.items.filter((item) => item.deliveryStatus === deliveryStatus);
  }

  async findBySecret(secret: string) {
    return this.items.find((item) => item.secret === secret) ?? null;
  }

  async findPending(userId: string, organizationId: string) {
    return (
      this.items.find(
        (item) =>
          item.userId === userId &&
          item.organizationId === organizationId &&
          item.status === 'pending',
      ) ?? null
    );
  }

  async save(invitation: Invitation) {
    this.items.push(invitation);
  }

  async recordDelivery(id: string, record: InvitationDeliveryRecord) {
    const invitation = this.items.find((item) => item.id === id);
    if (invitation) Object.assign(invitation, record);
  }

  async requeueDelivery(id: string) {
    const invitation = this.items.find((item) => item.id === id);
    if (
      !invitation ||
      invitation.status !== 'pending' ||
      invitation.deliveryStatus === 'queued'
    ) {
      return false;
    }
    invitation.deliveryStatus = 'queued';
    invitation.deliveryAttempts = 0;
    invitation.lastDeliveryFailureAt = null;
    return true;
  }

  async accept(invitation: Invitation) {
    const stored = this.items.find((item) => item.id === invitation.id);
    if (!stored || stored.status !== 'pending') {
      throw new ConflictDomainException('Invitation already accepted');
    }
    const user = await this.users?.findById(invitation.userId);
    if (
      user?.memberships.some(
        (m) => m.organizationId === invitation.organizationId,
      )
    ) {
      throw new ConflictDomainException(
        'User already belongs to this organization',
      );
    }
    stored.status = 'accepted';
    user?.memberships.push({
      organizationId: invitation.organizationId,
      role: invitation.role,
    });
  }
}
