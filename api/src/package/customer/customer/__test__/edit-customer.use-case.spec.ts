import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { EditCustomerUseCase } from '../edit-customer.use-case.js';

let customers: InMemoryCustomersRepository;
let sut: EditCustomerUseCase;

describe('EditCustomerUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    sut = new EditCustomerUseCase(customers);
  });

  it('[C7] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      customerId: 'missing',
      name: 'A',
      email: 'a@a.test',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
  });

  it('[C7] throws AlreadyExistsDomainException when the email belongs to another customer', async () => {
    customers.items.push(
      makeCustomer({ email: 'one@a.test' }, 'c1'),
      makeCustomer({ email: 'two@a.test' }, 'c2'),
    );

    const promise = sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'One',
      email: 'two@a.test',
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Customer already exists');
    expect(customers.items[0].email).toBe('one@a.test');
  });

  it("[C7] accepts the customer's own email", async () => {
    customers.items.push(makeCustomer({ email: 'one@a.test' }, 'c1'));

    const { customer } = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'Renamed',
      email: 'one@a.test',
    });

    expect(customer.name).toBe('Renamed');
    expect(customers.items[0].name).toBe('Renamed');
  });

  it('[C7] keeps the stored phone when none is given', async () => {
    customers.items.push(makeCustomer({ phone: '111' }, 'c1'));

    const { customer } = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'A',
      email: 'new@a.test',
    });

    expect(customer.phone).toBe('111');
  });

  it('[C7] keeps the stored phone when the phone is null', async () => {
    customers.items.push(makeCustomer({ phone: '111' }, 'c1'));

    const { customer } = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'A',
      email: 'new@a.test',
      phone: null,
    });

    expect(customer.phone).toBe('111');
  });

  it('[C7] replaces the phone when one is given', async () => {
    customers.items.push(makeCustomer({ phone: '111' }, 'c1'));

    const { customer } = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'A',
      email: 'new@a.test',
      phone: '222',
    });

    expect(customer.phone).toBe('222');
  });

  it('[C7] merges a partial address over the stored one and saves it', async () => {
    customers.items.push(
      makeCustomer(
        { address: { address: 'Rua 1', city: 'Santos', state: 'SP' } },
        'c1',
      ),
    );

    await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      name: 'A',
      email: 'new@a.test',
      address: { city: 'Guaruja' } as never,
    });

    expect(customers.items[0].address).toEqual({
      address: 'Rua 1',
      city: 'Guaruja',
      state: 'SP',
    });
    expect(customers.items[0].email).toBe('new@a.test');
  });
});
