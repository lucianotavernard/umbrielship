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
import { EditWorkOrderUseCase } from './edit-work-order.use-case';

let workOrders: InMemoryWorkOrdersRepository;
let sut: EditWorkOrderUseCase;

const input = {
  startDate: new Date('2026-05-01T00:00:00.000Z'),
  endDate: new Date('2026-05-09T00:00:00.000Z'),
  status: 'COMPLETED' as const,
};

describe('EditWorkOrderUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository(vessels);
    sut = new EditWorkOrderUseCase(workOrders);
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
  });

  it('[C21] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ workOrderId: 'missing', ...input });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });

  it('[C21] saves the new dates and status under the same id', async () => {
    workOrders.items.push(
      makeWorkOrder({ vesselId: 'vessel-1', status: 'PENDING' }, 'wo1'),
    );

    await sut.handle({ workOrderId: 'wo1', ...input });

    expect(workOrders.items).toHaveLength(1);
    expect(workOrders.items[0]).toMatchObject({
      id: 'wo1',
      ...input,
    });
  });
});
