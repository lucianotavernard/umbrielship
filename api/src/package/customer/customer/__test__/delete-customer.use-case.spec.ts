import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { DeleteCustomerUseCase } from '../delete-customer.use-case.js';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;
let sut: DeleteCustomerUseCase;

describe('DeleteCustomerUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    sut = new DeleteCustomerUseCase(customers, vessels);
  });

  it('[C35] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ organizationId: 'org-1', id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
  });

  it('[C35] throws NotFoundDomainException for a customer of another Organization and removes nothing', async () => {
    customers.items.push(makeCustomer({ organizationId: 'org-2' }, 'c2'));

    const promise = sut.handle({ organizationId: 'org-1', id: 'c2' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
    expect(customers.items.map((customer) => customer.id)).toEqual(['c2']);
  });

  it('[C35] removes exactly that customer', async () => {
    customers.items.push(
      makeCustomer({ email: 'a@a.test' }, 'c1'),
      makeCustomer({ email: 'b@b.test' }, 'c2'),
    );

    await sut.handle({ organizationId: 'org-1', id: 'c1' });

    expect(customers.items.map((customer) => customer.id)).toEqual(['c2']);
  });

  it('[C35] throws ConflictDomainException when the customer still has a vessel', async () => {
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({}, 'v1'));

    const promise = sut.handle({ organizationId: 'org-1', id: 'customer-1' });

    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Customer in use');
    expect(customers.items.map((customer) => customer.id)).toEqual([
      'customer-1',
    ]);
  });
});
