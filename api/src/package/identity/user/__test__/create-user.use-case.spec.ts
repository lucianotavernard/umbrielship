import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { FakeHasher } from '@test/cryptography/fake-hasher';
import { makeOrganization, makeUser } from '@test/factory';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { CreateUserUseCase } from '../create-user.use-case';

let users: InMemoryUsersRepository;
let organizations: InMemoryOrganizationsRepository;
let sut: CreateUserUseCase;

const input = {
  name: 'Ana',
  email: 'ana@x.test',
  password: 'plain-secret',
  role: 'operator' as const,
  organizationId: 'org-1',
};

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    organizations = new InMemoryOrganizationsRepository();
    sut = new CreateUserUseCase(users, organizations, new FakeHasher());
    organizations.items.push(makeOrganization({ name: 'Acme' }, 'org-1'));
  });

  it('[C51] stores the hashed password, one Membership and the active Organization, and returns no password', async () => {
    const { user } = await sut.handle(input);

    expect(user).toEqual({
      id: expect.any(String),
      name: 'Ana',
      email: 'ana@x.test',
      role: 'operator',
      organizationName: 'Acme',
    });
    const stored = users.items[0];
    expect(stored.password).not.toBe('plain-secret');
    expect(stored.password).toBe(await new FakeHasher().hash('plain-secret'));
    expect(stored.memberships).toEqual([
      { organizationId: 'org-1', role: 'operator' },
    ]);
    expect(stored.activeOrganizationId).toBe('org-1');
  });

  it('[C51] throws AlreadyExistsDomainException when the email exists in another letter case', async () => {
    users.items.push(makeUser({ email: 'ANA@x.test' }));

    const promise = sut.handle(input);

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('User already exists');
    expect(users.items).toHaveLength(1);
  });

  it('[C51] throws NotFoundDomainException for an unknown Organization and stores nothing', async () => {
    const promise = sut.handle({ ...input, organizationId: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
    expect(users.items).toHaveLength(0);
  });
});
