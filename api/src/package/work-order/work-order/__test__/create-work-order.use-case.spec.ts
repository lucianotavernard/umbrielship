import { beforeEach, describe, expect, it } from 'vitest';

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderUseCase } from '../create-work-order.use-case.js';

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
    workOrders = new InMemoryWorkOrdersRepository();
    sut = new CreateWorkOrderUseCase(workOrders, new CustomerFacade(vessels));
    customers.items.push(makeCustomer({}, 'customer-1'));
  });

  it('[C17] throws NotFoundDomainException for an unknown vesselId and stores nothing', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
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
      organizationId: 'org-1',
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
