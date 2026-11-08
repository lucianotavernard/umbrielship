import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import {
  makeCustomer,
  makeService,
  makeVessel,
  makeWorkOrder,
} from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository';
import { FetchWorkOrderServicesUseCase } from '../fetch-work-order-services.use-case';

let sut: FetchWorkOrderServicesUseCase;

describe('FetchWorkOrderServicesUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    const workOrders = new InMemoryWorkOrdersRepository();
    const services = new InMemoryWorkOrderServicesRepository();
    sut = new FetchWorkOrderServicesUseCase(workOrders, services);
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
    workOrders.items.push(makeWorkOrder({}, 'wo1'), makeWorkOrder({}, 'wo2'));
    services.items.push(
      makeService({ workOrderId: 'wo1' }, 's1'),
      makeService({ workOrderId: 'wo2' }, 's2'),
      makeService({ workOrderId: 'wo1' }, 's3'),
    );
  });

  it('[C24] throws NotFoundDomainException for an unknown work order', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      workOrderId: 'missing',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });

  it('[C24] returns only the services of that work order', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo1',
    });

    expect(result.services.map((service) => service.id)).toEqual(['s1', 's3']);
  });
});
