import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';

import { ConfigService } from '@/package/shared/module/config/config.service.js';

import { Organization } from '../../organization/organization.entity.js';
import { User } from '../../user/user.entity.js';
import {
  InvitationDelivery,
  InvitationDeliveryInput,
} from '../contracts/invitation-delivery.contract.js';
import { DeliverInvitationUseCase } from '../deliver-invitation.use-case.js';
import { Invitation } from '../invitation.entity.js';

class ScriptedInvitationDelivery implements InvitationDelivery {
  public calls: InvitationDeliveryInput[] = [];
  public next: () => Promise<void> = async () => undefined;

  async deliver(input: InvitationDeliveryInput): Promise<void> {
    this.calls.push(input);
    return this.next();
  }
}

let invitationsRepository: InMemoryInvitationsRepository;
let usersRepository: InMemoryUsersRepository;
let organizationsRepository: InMemoryOrganizationsRepository;
let delivery: ScriptedInvitationDelivery;
let webOrigin: string;
let destination: Organization;
let user: User;
let sut: DeliverInvitationUseCase;

function addInvitation(
  props: Partial<Parameters<typeof Invitation.create>[0]> = {},
) {
  const invitation = Invitation.create({
    userId: user.id,
    organizationId: destination.id,
    secret: 'ab12',
    status: 'pending',
    role: 'operator',
    ...props,
  });
  invitationsRepository.items.push(invitation);
  return invitation;
}

describe('Deliver invitation', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    invitationsRepository = new InMemoryInvitationsRepository(usersRepository);
    organizationsRepository = new InMemoryOrganizationsRepository();
    delivery = new ScriptedInvitationDelivery();
    webOrigin = 'http://localhost:4200';
    const configService = { get: () => webOrigin } as unknown as ConfigService;
    sut = new DeliverInvitationUseCase(
      invitationsRepository,
      usersRepository,
      organizationsRepository,
      delivery,
      configService,
    );

    destination = Organization.create({
      name: 'Costa Branca',
      email: 'costa@acme.com',
      isInternal: false,
    });
    organizationsRepository.items.push(destination);
    user = User.create({
      name: 'Ana',
      email: 'ana@acme.com',
      password: 'hashed',
      activeOrganizationId: destination.id,
      memberships: [],
    });
    usersRepository.items.push(user);

    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('[C55] delivers the email, organization, role and acceptance link of a pending invitation', async () => {
    const invitation = addInvitation({ role: 'administrator' });

    await sut.handle({ invitationId: invitation.id });

    expect(delivery.calls).toEqual([
      {
        organizationId: destination.id,
        invitationId: invitation.id,
        userId: user.id,
        email: 'ana@acme.com',
        organizationName: 'Costa Branca',
        role: 'administrator',
        acceptUrl: 'http://localhost:4200/invitations/accept?secret=ab12',
      },
    ]);
  });

  it('[C55] builds the acceptance link without a double slash when the web origin ends in a slash', async () => {
    webOrigin = 'https://app.acme.test/';
    const invitation = addInvitation();

    await sut.handle({ invitationId: invitation.id });

    expect(delivery.calls[0].acceptUrl).toBe(
      'https://app.acme.test/invitations/accept?secret=ab12',
    );
  });

  it('[C55] records the invitation delivered with the attempts it took', async () => {
    const first = addInvitation();
    const third = addInvitation({
      secret: 'cd34',
      deliveryAttempts: 2,
      lastDeliveryFailureAt: new Date(),
    });

    expect(await sut.handle({ invitationId: first.id })).toEqual({
      outcome: 'delivered',
    });
    expect(await sut.handle({ invitationId: third.id })).toEqual({
      outcome: 'delivered',
    });

    expect(invitationsRepository.items[0]).toMatchObject({
      deliveryStatus: 'delivered',
      deliveryAttempts: 1,
    });
    expect(invitationsRepository.items[1]).toMatchObject({
      deliveryStatus: 'delivered',
      deliveryAttempts: 3,
    });
  });

  it('[C55] counts a failed attempt and asks for a retry', async () => {
    const invitation = addInvitation();
    delivery.next = async () => {
      throw new Error('SMTP refused');
    };

    const before = Date.now();
    const result = await sut.handle({ invitationId: invitation.id });

    expect(result).toEqual({ outcome: 'retry' });
    const stored = invitationsRepository.items[0];
    expect(stored.deliveryStatus).toBe('queued');
    expect(stored.deliveryAttempts).toBe(1);
    expect(stored.lastDeliveryFailureAt).toBeInstanceOf(Date);
    expect(stored.lastDeliveryFailureAt!.getTime()).toBeGreaterThanOrEqual(
      before,
    );

    expect(await sut.handle({ invitationId: invitation.id })).toEqual({
      outcome: 'retry',
    });
    expect(invitationsRepository.items[0]).toMatchObject({
      deliveryStatus: 'queued',
      deliveryAttempts: 2,
    });
  });

  it('[C55] fails an attempt that does not resolve in 5 seconds', async () => {
    vi.useFakeTimers();
    const onTime = addInvitation();
    const late = addInvitation({ secret: 'cd34' });

    delivery.next = () => new Promise((resolve) => setTimeout(resolve, 4_900));
    const resolved = sut.handle({ invitationId: onTime.id });
    await vi.advanceTimersByTimeAsync(4_900);
    expect(await resolved).toEqual({ outcome: 'delivered' });

    delivery.next = () => new Promise(() => undefined);
    const hanging = sut.handle({ invitationId: late.id });
    await vi.advanceTimersByTimeAsync(4_999);
    expect(invitationsRepository.items[1].deliveryAttempts).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(await hanging).toEqual({ outcome: 'retry' });

    expect(invitationsRepository.items[0]).toMatchObject({
      deliveryStatus: 'delivered',
      deliveryAttempts: 1,
    });
    expect(invitationsRepository.items[1]).toMatchObject({
      deliveryStatus: 'queued',
      deliveryAttempts: 1,
    });
  });

  it('[C55] marks the delivery failed on the third failed attempt', async () => {
    const invitation = addInvitation();
    delivery.next = async () => {
      throw new Error('SMTP refused');
    };

    const outcomes: string[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      outcomes.push(
        (await sut.handle({ invitationId: invitation.id })).outcome,
      );
    }

    expect(outcomes).toEqual(['retry', 'retry', 'failed']);
    expect(invitationsRepository.items[0]).toMatchObject({
      deliveryStatus: 'failed',
      deliveryAttempts: 3,
    });
    expect(delivery.calls).toHaveLength(3);
  });

  it('[C55] delivers nothing for an accepted invitation', async () => {
    const failedAt = new Date('2026-11-05T10:00:00Z');
    const invitation = addInvitation({
      status: 'accepted',
      deliveryStatus: 'queued',
      deliveryAttempts: 1,
      lastDeliveryFailureAt: failedAt,
    });

    const result = await sut.handle({ invitationId: invitation.id });

    expect(result).toEqual({ outcome: 'skipped' });
    expect(delivery.calls).toHaveLength(0);
    expect(invitationsRepository.items[0]).toMatchObject({
      deliveryStatus: 'queued',
      deliveryAttempts: 1,
      lastDeliveryFailureAt: failedAt,
    });
  });

  it('[C55] fails the delivery when the user or the organization is gone', async () => {
    const noUser = addInvitation({ userId: 'gone-user' });
    const noOrganization = addInvitation({
      secret: 'cd34',
      organizationId: 'gone-organization',
    });

    expect(await sut.handle({ invitationId: noUser.id })).toEqual({
      outcome: 'failed',
    });
    expect(await sut.handle({ invitationId: noOrganization.id })).toEqual({
      outcome: 'failed',
    });

    expect(delivery.calls).toHaveLength(0);
    expect(invitationsRepository.items[0].deliveryStatus).toBe('failed');
    expect(invitationsRepository.items[1].deliveryStatus).toBe('failed');
  });

  it('[C55] finishes without writing when the invitation is gone', async () => {
    const write = vi.spyOn(invitationsRepository, 'recordDelivery');

    const result = await sut.handle({ invitationId: 'gone-invitation' });

    expect(result).toEqual({ outcome: 'skipped' });
    expect(write).not.toHaveBeenCalled();
    expect(delivery.calls).toHaveLength(0);
  });

  it('[C55] logs attempts and failures by id, never the email or the secret', async () => {
    const log = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const warn = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const error = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const invitation = addInvitation({ secret: 'secret-never-logged' });

    await sut.handle({ invitationId: invitation.id });
    delivery.next = async () => {
      throw new Error('SMTP refused');
    };
    const second = addInvitation({
      secret: 'another-secret',
      deliveryAttempts: 1,
    });
    await sut.handle({ invitationId: second.id });
    await sut.handle({ invitationId: second.id });

    const lines = [
      ...log.mock.calls,
      ...warn.mock.calls,
      ...error.mock.calls,
    ].map(([message]) => String(message));
    expect(lines.length).toBeGreaterThanOrEqual(5);
    for (const line of lines) {
      expect(line).not.toContain('ana@acme.com');
      expect(line).not.toContain('secret-never-logged');
      expect(line).not.toContain('another-secret');
      expect(JSON.parse(line)).toMatchObject({
        organizationId: destination.id,
        userId: user.id,
        invitationId: expect.any(String),
      });
    }
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });
});
