import { describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeOrganization } from '@test/factory.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { GetOrganizationByIdUseCase } from '../get-organization-by-id.use-case.js';

describe('GetOrganizationByIdUseCase', () => {
  const setup = () => {
    const organizations = new InMemoryOrganizationsRepository();
    organizations.items.push(
      makeOrganization({ name: 'Acme', email: 'a@x.test' }, 'o1'),
    );
    return new GetOrganizationByIdUseCase(organizations);
  };

  it('[C59] returns the Organization for a known id', async () => {
    expect((await setup().handle('o1')).organization).toEqual({
      id: 'o1',
      name: 'Acme',
      email: 'a@x.test',
      isInternal: false,
    });
  });

  it('[C59] throws NotFoundDomainException for an unknown id', async () => {
    const promise = setup().handle('missing');

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Organization not found');
  });
});
