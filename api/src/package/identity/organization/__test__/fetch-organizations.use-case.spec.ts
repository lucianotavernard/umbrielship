import { beforeEach, describe, expect, it } from 'vitest';

import { makeOrganization, makeUser } from '@test/factory.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { FetchOrganizationsUseCase } from '../fetch-organizations.use-case.js';

let organizations: InMemoryOrganizationsRepository;
let users: InMemoryUsersRepository;

describe('FetchOrganizationsUseCase', () => {
  beforeEach(() => {
    organizations = new InMemoryOrganizationsRepository();
    users = new InMemoryUsersRepository();
    organizations.items.push(
      makeOrganization({ name: 'Charlie', email: 'c@x.test' }, 'c'),
      makeOrganization({ name: 'Alpha', email: 'a@x.test' }, 'a'),
      makeOrganization({ name: 'Bravo', email: 'b@x.test' }, 'b'),
    );
  });

  it('[C59] pages by name and reports the full total', async () => {
    const sut = new FetchOrganizationsUseCase(organizations, users);

    const first = await sut.handle({ page: 1, perPage: 2 });
    const second = await sut.handle({ page: 2, perPage: 2 });

    expect(first.organizations.map((o) => o.name)).toEqual(['Alpha', 'Bravo']);
    expect(first.total).toBe(3);
    expect(second.organizations.map((o) => o.name)).toEqual(['Charlie']);
  });

  it('organization-list C3 keeps the names and emails that contain the search, without case', async () => {
    const sut = new FetchOrganizationsUseCase(organizations, users);

    const byName = await sut.handle({ page: 1, perPage: 10, search: 'BRAV' });
    const byEmail = await sut.handle({ page: 1, perPage: 10, search: 'c@x' });

    expect(byName.organizations.map((o) => o.name)).toEqual(['Bravo']);
    expect(byName.total).toBe(1);
    expect(byEmail.organizations.map((o) => o.name)).toEqual(['Charlie']);
  });

  it('organization-list C4 names up to four members of each Organization by name and counts them all', async () => {
    const names = ['Eva', 'Ana', 'Caio', 'Bia', 'Davi'];
    names.forEach((name, index) =>
      users.items.push(
        makeUser({
          id: `u${index}`,
          name,
          email: `${name}@x.test`,
          activeOrganizationId: 'a',
          memberships: [{ organizationId: 'a', role: 'operator' }],
        }),
      ),
    );
    users.items.push(
      makeUser({
        id: 'other',
        name: 'Outro',
        email: 'outro@x.test',
        activeOrganizationId: 'b',
        memberships: [{ organizationId: 'b', role: 'operator' }],
      }),
    );
    const sut = new FetchOrganizationsUseCase(organizations, users);

    const { organizations: rows } = await sut.handle({ page: 1, perPage: 10 });

    expect(rows[0].members).toHaveLength(4);
    expect(rows[0].memberCount).toBe(5);
    expect(rows[1].members).toEqual([{ id: 'other', name: 'Outro' }]);
    expect(rows[1].memberCount).toBe(1);
    expect(rows[2].members).toEqual([]);
    expect(rows[2].memberCount).toBe(0);
  });
});
