import { InvitationDeliveryQueue } from '@/package/identity/invitation/contracts/invitation-delivery-queue.contract.js';

export class FakeInvitationDeliveryQueue implements InvitationDeliveryQueue {
  public enqueued: string[] = [];
  public failure: Error | null = null;

  async enqueue(invitationId: string): Promise<void> {
    if (this.failure) throw this.failure;
    if (!this.enqueued.includes(invitationId)) this.enqueued.push(invitationId);
  }
}
