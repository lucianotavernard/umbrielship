import { describe, expect, it } from 'vitest';

import { makeCustomer } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { FetchCustomersUseCase } from '../fetch-customers.use-case';

describe('FetchCustomersUseCase', () => {
  it('[C8] returns the 2nd and 3rd customers for take 2 skip 1 and total 3', async () => {
    const customers = new InMemoryCustomersRepository();
    customers.items.push(
      makeCustomer({ email: '1@a.test' }, 'c1'),
      makeCustomer({ email: '2@a.test' }, 'c2'),
      makeCustomer({ email: '3@a.test' }, 'c3'),
    );

    const result = await new FetchCustomersUseCase(customers).handle({
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
