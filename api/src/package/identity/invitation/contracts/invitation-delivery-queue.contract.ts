export abstract class InvitationDeliveryQueue {
  // Puts the delivery of one Invitation on the queue; a second call for an Invitation already there adds nothing.
  abstract enqueue(invitationId: string): Promise<void>;
}
