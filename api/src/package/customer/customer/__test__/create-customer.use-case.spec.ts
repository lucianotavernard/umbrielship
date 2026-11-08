import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

import { makeCustomer } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { CreateCustomerUseCase } from '../create-customer.use-case.js';

let customers: InMemoryCustomersRepository;
let sut: CreateCustomerUseCase;

describe('CreateCustomerUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    sut = new CreateCustomerUseCase(customers);
  });

  it('[C6] stores a customer with a new email and the given address', async () => {
    const { customer } = await sut.handle({
      organizationId: 'org-1',
      name: 'Atlantic Shipping',
      email: 'ops@atlantic.test',
      phone: '+55 13 99999-0000',
      address: { address: 'Rua do Porto 1', city: 'Santos', state: 'SP' },
    });

    expect(customers.items).toHaveLength(1);
    expect(customers.items[0]).toBe(customer);
    expect(customer.email).toBe('ops@atlantic.test');
    expect(customer.address).toEqual({
      address: 'Rua do Porto 1',
      city: 'Santos',
      state: 'SP',
    });
  });

  it('[C6] throws AlreadyExistsDomainException for an email already stored and stores nothing more', async () => {
    customers.items.push(makeCustomer({ email: 'ops@atlantic.test' }));

    const promise = sut.handle({
      organizationId: 'org-1',
      name: 'Other',
      email: 'ops@atlantic.test',
      address: { address: 'x', city: 'y', state: 'z' },
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Customer already exists');
    expect(customers.items).toHaveLength(1);
  });
});
