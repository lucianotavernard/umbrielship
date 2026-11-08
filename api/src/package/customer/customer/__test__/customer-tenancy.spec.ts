import { describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { CreateCustomerUseCase } from '../create-customer.use-case.js';
import { EditCustomerUseCase } from '../edit-customer.use-case.js';
import { FetchCustomersUseCase } from '../fetch-customers.use-case.js';
import { GetCustomerByIdUseCase } from '../get-customer-by-id.use-case.js';

const address = { address: 'Rua 1', city: 'Santos', state: 'SP' };

describe('Customer tenancy', () => {
  it('[C35] FetchCustomersUseCase lists only the Organization customers and its total', async () => {
    const customers = new InMemoryCustomersRepository();
    customers.items.push(
      makeCustomer({ organizationId: 'A', email: 'a1@x.test' }, 'a1'),
      makeCustomer({ organizationId: 'A', email: 'a2@x.test' }, 'a2'),
      makeCustomer({ organizationId: 'B', email: 'b1@x.test' }, 'b1'),
    );

    const result = await new FetchCustomersUseCase(customers).handle({
      organizationId: 'A',
      take: 10,
      skip: 0,
    });

    expect(result.customers.map((customer) => customer.id)).toEqual([
      'a1',
      'a2',
    ]);
    expect(result.total).toBe(2);
  });

  it('[C35] GetCustomerByIdUseCase answers not found for a customer of another Organization', async () => {
    const customers = new InMemoryCustomersRepository();
    customers.items.push(makeCustomer({ organizationId: 'B' }, 'b1'));

    const promise = new GetCustomerByIdUseCase(customers).handle({
      organizationId: 'A',
      id: 'b1',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
  });

  it('[C35] EditCustomerUseCase answers not found for a customer of another Organization and changes nothing', async () => {
    const customers = new InMemoryCustomersRepository();
    customers.items.push(
      makeCustomer({ organizationId: 'B', name: 'Keep' }, 'b1'),
    );

    const promise = new EditCustomerUseCase(customers).handle({
      organizationId: 'A',
      customerId: 'b1',
      name: 'Changed',
      email: 'new@x.test',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
    expect(customers.items[0].name).toBe('Keep');
  });

  it('[C35] CreateCustomerUseCase accepts the same email in two Organizations', async () => {
    const customers = new InMemoryCustomersRepository();
    const sut = new CreateCustomerUseCase(customers);

    await sut.handle({
      organizationId: 'A',
      name: 'One',
      email: 'ops@atlantic.test',
      address,
    });
    await sut.handle({
      organizationId: 'B',
      name: 'Two',
      email: 'ops@atlantic.test',
      address,
    });

    expect(customers.items).toHaveLength(2);
    expect(customers.items.map((customer) => customer.organizationId)).toEqual([
      'A',
      'B',
    ]);
  });

  it('[C35] CreateCustomerUseCase rejects the same email in another letter case in one Organization', async () => {
    const customers = new InMemoryCustomersRepository();
    const sut = new CreateCustomerUseCase(customers);
    await sut.handle({
      organizationId: 'A',
      name: 'One',
      email: 'ops@atlantic.test',
      address,
    });

    const promise = sut.handle({
      organizationId: 'A',
      name: 'Two',
      email: 'Ops@Atlantic.test',
      address,
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Customer already exists');
    expect(customers.items).toHaveLength(1);
  });
});
