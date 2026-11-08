import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeCustomer, makeVessel } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { GetVesselByIdUseCase } from '../get-vessel-by-id.use-case';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;
let sut: GetVesselByIdUseCase;

describe('GetVesselByIdUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    sut = new GetVesselByIdUseCase(vessels);
  });

  it('[C14] returns the vessel with its customer', async () => {
    customers.items.push(makeCustomer({ name: 'Atlantic' }, 'c1'));
    vessels.items.push(makeVessel({ customerId: 'c1' }, 'v1'));

    const { vessel } = await sut.handle({ id: 'v1' });

    expect(vessel.id).toBe('v1');
    expect(vessel.customer.id).toBe('c1');
    expect(vessel.customer.name).toBe('Atlantic');
  });

  it('[C14] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
  });
});
