import { describe, expect, it } from 'vitest';

import { makeUser } from '@test/factory.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { FetchUsersUseCase } from '../fetch-users.use-case.js';

describe('FetchUsersUseCase', () => {
  it('[C61] returns only the Users with no Membership in the Organization, paged, with the total', async () => {
    const users = new InMemoryUsersRepository();
    users.items.push(
      makeUser({
        email: '1@x.test',
        memberships: [{ organizationId: 'o1', role: 'operator' }],
      }),
      makeUser({
        email: '2@x.test',
        memberships: [{ organizationId: 'o2', role: 'operator' }],
      }),
      makeUser({ email: '3@x.test', memberships: [] }),
    );
    users.items[0].id = 'u1';
    users.items[1].id = 'u2';
    users.items[2].id = 'u3';
    const sut = new FetchUsersUseCase(users);

    const page1 = await sut.handle({
      notInOrganizationId: 'o1',
      page: 1,
      perPage: 1,
    });
    const page2 = await sut.handle({
      notInOrganizationId: 'o1',
      page: 2,
      perPage: 1,
    });

    expect(page1.users).toEqual([
      { id: 'u2', name: 'Maria Souza', email: '2@x.test' },
    ]);
    expect(page1.total).toBe(2);
    expect(page2.users.map((u) => u.id)).toEqual(['u3']);
  });
});
