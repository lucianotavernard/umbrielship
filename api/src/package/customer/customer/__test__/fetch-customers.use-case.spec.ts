import { describe, expect, it } from 'vitest';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { FetchCustomersUseCase } from '../fetch-customers.use-case.js';

describe('FetchCustomersUseCase', () => {
  it('[C8] returns the 2nd and 3rd customers for take 2 skip 1 and total 3', async () => {
    const customers = new InMemoryCustomersRepository();
    customers.items.push(
      makeCustomer({ email: '1@a.test' }, 'c1'),
      makeCustomer({ email: '2@a.test' }, 'c2'),
      makeCustomer({ email: '3@a.test' }, 'c3'),
    );

    const result = await new FetchCustomersUseCase(customers).handle({
      organizationId: 'org-1',
      take: 2,
      skip: 1,
    });

    expect(result.customers.map((customer) => customer.id)).toEqual([
      'c2',
      'c3',
    ]);
    expect(result.total).toBe(3);
  });
});

describe('FetchCustomersUseCase without a page', () => {
  it('customer-ui C13 returns every customer of the Organization with its vessel count when no page is given', async () => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    for (let index = 1; index <= 23; index++) {
      customers.items.push(
        makeCustomer(
          { organizationId: 'A', email: `c${index}@a.test` },
          `c${index}`,
        ),
      );
    }
    // Same email, another Organization: never listed.
    customers.items.push(
      makeCustomer({ organizationId: 'B', email: 'c1@a.test' }, 'b1'),
    );
    vessels.items.push(
      makeVessel({ organizationId: 'A', customerId: 'c2' }, 'v1'),
      makeVessel({ organizationId: 'A', customerId: 'c2' }, 'v2'),
      makeVessel({ organizationId: 'B', customerId: 'b1' }, 'v3'),
    );

    const result = await new FetchCustomersUseCase(customers).handle({
      organizationId: 'A',
    });

    expect(result.customers).toHaveLength(23);
    expect(result.total).toBe(23);
    expect(result.customers.map((customer) => customer.id)).not.toContain('b1');
    const count = (id: string) =>
      result.customers.find((customer) => customer.id === id)?.vesselCount;
    expect(count('c1')).toBe(0);
    expect(count('c2')).toBe(2);
  });
});
