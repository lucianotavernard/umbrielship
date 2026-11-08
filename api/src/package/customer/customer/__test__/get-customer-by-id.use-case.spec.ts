import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { GetCustomerByIdUseCase } from '../get-customer-by-id.use-case.js';

let customers: InMemoryCustomersRepository;
let sut: GetCustomerByIdUseCase;

describe('GetCustomerByIdUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    sut = new GetCustomerByIdUseCase(customers);
  });

  it('[C9] returns the customer of a known id', async () => {
    customers.items.push(makeCustomer({}, 'c1'));

    const { customer } = await sut.handle({
      organizationId: 'org-1',
      id: 'c1',
    });

    expect(customer.id).toBe('c1');
  });

  it('[C9] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ organizationId: 'org-1', id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
  });
});
