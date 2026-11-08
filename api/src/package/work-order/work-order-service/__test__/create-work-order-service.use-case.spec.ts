import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeCustomer, makeVessel, makeWorkOrder } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository';
import { CreateWorkOrderServiceUseCase } from '../create-work-order-service.use-case';

let workOrders: InMemoryWorkOrdersRepository;
let services: InMemoryWorkOrderServicesRepository;
let sut: CreateWorkOrderServiceUseCase;

const input = {
  name: 'Painting',
  description: 'Two coats',
  startDate: new Date('2026-03-01T00:00:00.000Z'),
  endDate: new Date('2026-03-03T00:00:00.000Z'),
  status: 'IN_PROGRESS' as const,
};

describe('CreateWorkOrderServiceUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository();
    services = new InMemoryWorkOrderServicesRepository();
    sut = new CreateWorkOrderServiceUseCase(workOrders, services);
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
    workOrders.items.push(makeWorkOrder({}, 'wo1'));
  });

  it('[C18] throws NotFoundDomainException for an unknown work order and stores nothing', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      workOrderId: 'missing',
      ...input,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
    expect(services.items).toHaveLength(0);
  });

  it('[C18] stores the service under that workOrderId', async () => {
    const { service } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo1',
      ...input,
    });

    expect(services.items).toEqual([service]);
    expect(service).toMatchObject({ workOrderId: 'wo1', ...input });
  });
});
