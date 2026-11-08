import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeOrganization, makeUser } from '@test/factory.js';
import { InMemoryInvitationsRepository } from '@test/repositories/in-memory-invitations-repository.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { FetchInvitationsUseCase } from '../fetch-invitations.use-case.js';
import { Invitation } from '../invitation.entity.js';

let invitations: InMemoryInvitationsRepository;
let sut: FetchInvitationsUseCase;

describe('FetchInvitationsUseCase', () => {
  beforeEach(() => {
    invitations = new InMemoryInvitationsRepository();
    const users = new InMemoryUsersRepository();
    const organizations = new InMemoryOrganizationsRepository();
    users.items.push(makeUser({ email: 'maria@x.test' }));
    organizations.items.push(makeOrganization({}, 'o1'));
    const at = (id: string, day: number) =>
      Invitation.create(
        {
          userId: 'user-1',
          organizationId: 'o1',
          secret: `secret-${id}`,
          status: 'pending',
          role: 'operator',
          createdAt: new Date(`2026-01-0${day}T00:00:00.000Z`),
        },
        id,
      );
    invitations.items.push(at('old', 1), at('new', 3), at('mid', 2));
    sut = new FetchInvitationsUseCase(invitations, users, organizations);
  });

  it('[C62] returns newest first, without the secret, paged, with the total', async () => {
    const result = await sut.handle({
      organizationId: 'o1',
      page: 1,
      perPage: 2,
    });

    expect(result.invitations).toEqual([
      {
        id: 'new',
        email: 'maria@x.test',
        role: 'operator',
        status: 'pending',
        deliveryStatus: 'queued',
      },
      {
        id: 'mid',
        email: 'maria@x.test',
        role: 'operator',
        status: 'pending',
        deliveryStatus: 'queued',
      },
    ]);
    expect(result.total).toBe(3);
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it('[C62] throws NotFoundDomainException for an unknown Organization', async () => {
    const promise = sut.handle({
      organizationId: 'missing',
      page: 1,
      perPage: 10,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
  });
});
