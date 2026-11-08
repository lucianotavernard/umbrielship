import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { CreateVesselUseCase } from '../create-vessel.use-case.js';
import { DeleteVesselUseCase } from '../delete-vessel.use-case.js';
import { EditVesselUseCase } from '../edit-vessel.use-case.js';
import { FetchVesselsUseCase } from '../fetch-vessels.use-case.js';
import { GetVesselByIdUseCase } from '../get-vessel-by-id.use-case.js';

let customers: InMemoryCustomersRepository;
let vessels: InMemoryVesselsRepository;

const input = { name: 'Nova', type: 'TANKER' as const, length: 90 };

describe('Vessel tenancy', () => {
  beforeEach(() => {
    customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    customers.items.push(
      makeCustomer({ organizationId: 'A', email: 'a@x.test' }, 'ca'),
      makeCustomer({ organizationId: 'B', email: 'b@x.test' }, 'cb'),
    );
  });

  it('[C36] stores the same IMO number in two Organizations', async () => {
    const sut = new CreateVesselUseCase(vessels, customers);

    await sut.handle({
      ...input,
      organizationId: 'A',
      customerId: 'ca',
      imoNumber: '9074729',
    });
    await sut.handle({
      ...input,
      organizationId: 'B',
      customerId: 'cb',
      imoNumber: '9074729',
    });

    expect(vessels.items).toHaveLength(2);
  });

  it('[C36] rejects an IMO number repeated in another letter case in one Organization', async () => {
    const sut = new CreateVesselUseCase(vessels, customers);
    await sut.handle({
      ...input,
      organizationId: 'A',
      customerId: 'ca',
      imoNumber: 'abc123',
    });

    const promise = sut.handle({
      ...input,
      organizationId: 'A',
      customerId: 'ca',
      imoNumber: 'ABC123',
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Vessel already exists');
    expect(vessels.items).toHaveLength(1);
  });

  it('[C36] CreateVesselUseCase answers customer not found for a Customer of another Organization', async () => {
    const promise = new CreateVesselUseCase(vessels, customers).handle({
      ...input,
      organizationId: 'A',
      customerId: 'cb',
      imoNumber: '9074729',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Customer not found');
    expect(vessels.items).toHaveLength(0);
  });

  it('[C36] get, edit and delete answer vessel not found for a Vessel of another Organization', async () => {
    vessels.items.push(
      makeVessel({ organizationId: 'B', customerId: 'cb' }, 'vb'),
    );

    const get = new GetVesselByIdUseCase(vessels).handle({
      organizationId: 'A',
      id: 'vb',
    });
    const edit = new EditVesselUseCase(vessels).handle({
      ...input,
      organizationId: 'A',
      vesselId: 'vb',
      customerId: 'cb',
    });
    const remove = new DeleteVesselUseCase(vessels).handle({
      organizationId: 'A',
      id: 'vb',
    });

    for (const promise of [get, edit, remove]) {
      await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
      await expect(promise).rejects.toThrow('Vessel not found');
    }
    expect(vessels.items).toHaveLength(1);
    expect(vessels.items[0].name).toBe('Aurora');
  });

  it('[C36] FetchVesselsUseCase lists only the Organization vessels, with and without customerId', async () => {
    vessels.items.push(
      makeVessel(
        { organizationId: 'A', customerId: 'ca', imoNumber: '1' },
        'va',
      ),
      makeVessel(
        { organizationId: 'B', customerId: 'cb', imoNumber: '2' },
        'vb',
      ),
    );
    const sut = new FetchVesselsUseCase(vessels);

    const all = await sut.handle({ organizationId: 'A', take: 10, skip: 0 });
    const byCustomer = await sut.handle({
      organizationId: 'A',
      customerId: 'cb',
      take: 10,
      skip: 0,
    });

    expect(all.vessels.map((vessel) => vessel.id)).toEqual(['va']);
    expect(all.total).toBe(1);
    expect(byCustomer.vessels).toEqual([]);
    expect(byCustomer.total).toBe(0);
  });
});
