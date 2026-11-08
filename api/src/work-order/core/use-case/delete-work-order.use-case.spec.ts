import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import {
  makeCustomer,
  makeVessel,
  makeWorkOrder,
} from '../../../../test/factory';
import { InMemoryCustomersRepository } from '../../../../test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '../../../../test/repositories/in-memory-vessels-repository';
import { InMemoryWorkOrdersRepository } from '../../../../test/repositories/in-memory-work-orders-repository';
import { DeleteWorkOrderUseCase } from './delete-work-order.use-case';

let workOrders: InMemoryWorkOrdersRepository;
let sut: DeleteWorkOrderUseCase;

describe('DeleteWorkOrderUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository(vessels);
    sut = new DeleteWorkOrderUseCase(workOrders);
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
  });

  it('[C19] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });

  it('[C19] removes exactly that work order', async () => {
    workOrders.items.push(makeWorkOrder({}, 'wo1'), makeWorkOrder({}, 'wo2'));

    await sut.handle({ id: 'wo1' });

    expect(workOrders.items.map((item) => item.id)).toEqual(['wo2']);
  });
});
