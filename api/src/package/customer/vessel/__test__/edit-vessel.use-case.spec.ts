import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeCustomer, makeVessel } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { EditVesselUseCase } from '../edit-vessel.use-case';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;
let sut: EditVesselUseCase;

describe('EditVesselUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    sut = new EditVesselUseCase(vessels);
    customers.items.push(
      makeCustomer({ email: '1@a.test' }, 'c1'),
      makeCustomer({ email: '2@a.test' }, 'c2'),
    );
    vessels.items.push(
      makeVessel({ customerId: 'c1', imoNumber: '9074729' }, 'v1'),
    );
  });

  const input = {
    vesselId: 'v1',
    customerId: 'c1',
    name: 'Nova',
    type: 'FISHING' as const,
    length: 55,
  };

  it('[C12] throws NotFoundDomainException for an unknown vessel', async () => {
    const promise = sut.handle({ ...input, vesselId: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
  });

  it('[C12] throws NotFoundDomainException when the customer does not own the vessel', async () => {
    const promise = sut.handle({ ...input, customerId: 'c2' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
    expect(vessels.items[0].name).toBe('Aurora');
  });

  it('[C12] changes name, type and length and keeps imoNumber and customerId', async () => {
    const { vessel } = await sut.handle(input);

    expect(vessel).toMatchObject({
      name: 'Nova',
      type: 'FISHING',
      length: 55,
      imoNumber: '9074729',
      customerId: 'c1',
    });

    expect(vessels.items[0]).toMatchObject({
      id: 'v1',
      name: 'Nova',
      type: 'FISHING',
      length: 55,
      imoNumber: '9074729',
      customerId: 'c1',
    });
  });
});
