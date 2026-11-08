import { beforeEach, describe, expect, it } from 'vitest';

import { CustomerFacade } from '@/package/customer/customer.facade';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeCustomer, makeVessel, makeWorkOrder } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository';
import { GetWorkOrderByIdUseCase } from '../get-work-order-by-id.use-case';

let workOrders: InMemoryWorkOrdersRepository;
let sut: GetWorkOrderByIdUseCase;

describe('GetWorkOrderByIdUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository();
    sut = new GetWorkOrderByIdUseCase(workOrders, new CustomerFacade(vessels));
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(
      makeVessel(
        {
          customerId: 'customer-1',
          name: 'Aurora',
          type: 'TANKER',
          length: 150,
        },
        'vessel-1',
      ),
    );
  });

  it('[C26] returns the work order with its vessel', async () => {
    workOrders.items.push(makeWorkOrder({ vesselId: 'vessel-1' }, 'wo1'));

    const { workOrder } = await sut.handle({
      organizationId: 'org-1',
      id: 'wo1',
    });

    expect(workOrder.id).toBe('wo1');
    expect(workOrder.vessel).toEqual({
      vesselId: 'vessel-1',
      name: 'Aurora',
      type: 'TANKER',
      length: 150,
    });
  });

  it('[C26] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ organizationId: 'org-1', id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });
});
