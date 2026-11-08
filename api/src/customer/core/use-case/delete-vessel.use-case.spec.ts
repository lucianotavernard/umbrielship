import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeCustomer, makeVessel } from '../../../../test/factory';
import { InMemoryCustomersRepository } from '../../../../test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '../../../../test/repositories/in-memory-vessels-repository';
import { DeleteVesselUseCase } from './delete-vessel.use-case';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;
let sut: DeleteVesselUseCase;

describe('DeleteVesselUseCase', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    sut = new DeleteVesselUseCase(vessels);
    customers.items.push(makeCustomer({}, 'customer-1'));
  });

  it('[C11] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
  });

  it('[C11] removes exactly that vessel', async () => {
    vessels.items.push(
      makeVessel({ imoNumber: '1' }, 'v1'),
      makeVessel({ imoNumber: '2' }, 'v2'),
    );

    await sut.handle({ id: 'v1' });

    expect(vessels.items.map((vessel) => vessel.id)).toEqual(['v2']);
  });
});
