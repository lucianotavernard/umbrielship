import { beforeEach, describe, expect, it } from 'vitest';

import { makeOrganization } from '@test/factory.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { FetchOrganizationsUseCase } from '../fetch-organizations.use-case.js';

let organizations: InMemoryOrganizationsRepository;

describe('FetchOrganizationsUseCase', () => {
  beforeEach(() => {
    organizations = new InMemoryOrganizationsRepository();
    organizations.items.push(
      makeOrganization({ name: 'Charlie', email: 'c@x.test' }, 'c'),
      makeOrganization({ name: 'Alpha', email: 'a@x.test' }, 'a'),
      makeOrganization({ name: 'Bravo', email: 'b@x.test' }, 'b'),
    );
  });

  it('[C59] pages by name and reports the full total', async () => {
    const sut = new FetchOrganizationsUseCase(organizations);

    const first = await sut.handle({ page: 1, perPage: 2 });
    const second = await sut.handle({ page: 2, perPage: 2 });

    expect(first.organizations.map((o) => o.name)).toEqual(['Alpha', 'Bravo']);
    expect(first.total).toBe(3);
    expect(second.organizations.map((o) => o.name)).toEqual(['Charlie']);
  });
});
