import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeCustomer, makeVessel } from '../../../../test/factory';
import { InMemoryCustomersRepository } from '../../../../test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '../../../../test/repositories/in-memory-vessels-repository';
import { InMemoryWorkOrdersRepository } from '../../../../test/repositories/in-memory-work-orders-repository';
import { CreateWorkOrderUseCase } from './create-work-order.use-case';

let vessels: InMemoryVesselsRepository;
let workOrders: InMemoryWorkOrdersRepository;
let sut: CreateWorkOrderUseCase;

const dates = {
  startDate: new Date('2026-02-01T00:00:00.000Z'),
  endDate: new Date('2026-02-15T00:00:00.000Z'),
};

describe('CreateWorkOrderUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository(vessels);
    sut = new CreateWorkOrderUseCase(workOrders, vessels);
    customers.items.push(makeCustomer({}, 'customer-1'));
  });

  it('[C17] throws NotFoundDomainException for an unknown vesselId and stores nothing', async () => {
    const promise = sut.handle({
      vesselId: 'missing',
      status: 'PENDING',
      ...dates,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
    expect(workOrders.items).toHaveLength(0);
  });

  it('[C17] stores the work order of a known vessel with the given dates and status', async () => {
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'v1'));

    const { workOrder } = await sut.handle({
      vesselId: 'v1',
      status: 'IN_PROGRESS',
      ...dates,
    });

    expect(workOrders.items).toEqual([workOrder]);
    expect(workOrder).toMatchObject({
      vesselId: 'v1',
      status: 'IN_PROGRESS',
      ...dates,
    });
  });
});
