import type { JobsOptions } from 'bullmq';

import { MAX_DELIVERY_ATTEMPTS } from './deliver-invitation.use-case';

export const INVITATION_DELIVERY_QUEUE = 'invitation-delivery';

export type InvitationDeliveryJobData = {
  invitationId: string;
};

// The job id is the Invitation id, so the queue holds at most one delivery per Invitation.
// Finished jobs are removed, so a resend can add the same id again.
export const invitationDeliveryJobOptions = (
  invitationId: string,
): JobsOptions => ({
  jobId: invitationId,
  attempts: MAX_DELIVERY_ATTEMPTS,
  backoff: { type: 'custom' },
  removeOnComplete: true,
  removeOnFail: true,
});

// 5 s before the second attempt, 10 s before the third.
export const invitationDeliveryBackoff = (attemptsMade: number): number =>
  attemptsMade <= 1 ? 5_000 : 10_000;
