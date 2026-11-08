import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';

import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository';
import { CreateOrganizationUseCase } from '../create-organization.use-case';

let organizations: InMemoryOrganizationsRepository;
let sut: CreateOrganizationUseCase;

describe('CreateOrganizationUseCase', () => {
  beforeEach(() => {
    organizations = new InMemoryOrganizationsRepository();
    sut = new CreateOrganizationUseCase(organizations);
  });

  it('[C49] stores a non-internal Organization and returns it', async () => {
    const { organization } = await sut.handle({
      name: 'Acme',
      email: 'a@acme.test',
    });

    expect(organization).toEqual({
      id: expect.any(String),
      name: 'Acme',
      email: 'a@acme.test',
      isInternal: false,
    });
    expect(organizations.items).toHaveLength(1);
    expect(organizations.items[0].isInternal).toBe(false);
  });

  it('[C49] rejects a name that exists in another letter case', async () => {
    await sut.handle({ name: 'Acme', email: 'a@acme.test' });

    const promise = sut.handle({ name: 'acme', email: 'b@acme.test' });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    expect(organizations.items).toHaveLength(1);
  });

  it('[C49] rejects an email that exists in another letter case', async () => {
    await sut.handle({ name: 'Acme', email: 'a@acme.test' });

    const promise = sut.handle({ name: 'Other', email: 'A@Acme.test' });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    expect(organizations.items).toHaveLength(1);
  });
});
