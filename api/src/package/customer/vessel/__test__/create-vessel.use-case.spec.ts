import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { CreateVesselUseCase } from '../create-vessel.use-case.js';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;
let sut: CreateVesselUseCase;

const input = {
  organizationId: 'org-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'TANKER' as const,
  length: 180,
  customerId: 'c1',
};

describe('CreateVesselUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    sut = new CreateVesselUseCase(vessels, customers);
  });

  it('[C10] stores the vessel of a known customer', async () => {
    customers.items.push(makeCustomer({}, 'c1'));

    const { vessel } = await sut.handle(input);

    expect(vessels.items).toEqual([vessel]);
    expect(vessel).toMatchObject({
      imoNumber: '9074729',
      name: 'Aurora',
      type: 'TANKER',
      length: 180,
      customerId: 'c1',
    });
  });

  it('[C10] throws AlreadyExistsDomainException for an IMO number already stored', async () => {
    customers.items.push(makeCustomer({}, 'c1'));
    vessels.items.push(makeVessel({ imoNumber: '9074729', customerId: 'c1' }));

    const promise = sut.handle(input);

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Vessel already exists');
    expect(vessels.items).toHaveLength(1);
  });

  it('[C10] rejects a duplicate IMO number whatever the customer id', async () => {
    vessels.items.push(makeVessel({ imoNumber: '9074729', customerId: 'c1' }));

    await expect(
      sut.handle({ ...input, customerId: '' }),
    ).rejects.toBeInstanceOf(AlreadyExistsDomainException);
  });

  it('[C10] checks the duplicate IMO number before the customer', async () => {
    vessels.items.push(
      makeVessel({ imoNumber: '9074729', customerId: 'gone' }),
    );

    await expect(sut.handle(input)).rejects.toBeInstanceOf(
      AlreadyExistsDomainException,
    );
  });

  it('[C10] throws NotFoundDomainException for an unknown customer and stores nothing', async () => {
    const promise = sut.handle(input);

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
    expect(vessels.items).toHaveLength(0);
  });
});
