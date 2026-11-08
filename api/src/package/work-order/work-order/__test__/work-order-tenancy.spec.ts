import { beforeEach, describe, expect, it } from 'vitest';

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel, makeWorkOrder } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderUseCase } from '../create-work-order.use-case.js';
import { DeleteWorkOrderUseCase } from '../delete-work-order.use-case.js';
import { EditWorkOrderUseCase } from '../edit-work-order.use-case.js';
import { FetchWorkOrdersUseCase } from '../fetch-work-orders.use-case.js';
import { GetWorkOrderByIdUseCase } from '../get-work-order-by-id.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let vessels: InMemoryVesselsRepository;
let facade: CustomerFacade;

const dates = {
  startDate: new Date('2026-02-01T00:00:00.000Z'),
  endDate: new Date('2026-02-15T00:00:00.000Z'),
};

describe('WorkOrder tenancy', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository();
    facade = new CustomerFacade(vessels);
    customers.items.push(
      makeCustomer({ organizationId: 'A', email: 'a@x.test' }, 'ca'),
      makeCustomer({ organizationId: 'B', email: 'b@x.test' }, 'cb'),
    );
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
  });

  it('[C37] CreateWorkOrderUseCase answers vessel not found for a Vessel of another Organization and stores nothing', async () => {
    const promise = new CreateWorkOrderUseCase(workOrders, facade).handle({
      organizationId: 'A',
      vesselId: 'vb',
      status: 'PENDING',
      ...dates,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
    expect(workOrders.items).toHaveLength(0);
  });

  it('[C37] get, edit and delete answer work order not found for a work order of another Organization', async () => {
    workOrders.items.push(
      makeWorkOrder({ organizationId: 'B', vesselId: 'vb' }, 'wb'),
    );

    const get = new GetWorkOrderByIdUseCase(workOrders, facade).handle({
      organizationId: 'A',
      id: 'wb',
    });
    const edit = new EditWorkOrderUseCase(workOrders).handle({
      organizationId: 'A',
      workOrderId: 'wb',
      status: 'COMPLETED',
      ...dates,
    });
    const remove = new DeleteWorkOrderUseCase(workOrders).handle({
      organizationId: 'A',
      id: 'wb',
    });

    for (const promise of [get, edit, remove]) {
      await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
      await expect(promise).rejects.toThrow('Work order not found');
    }
    expect(workOrders.items).toHaveLength(1);
    expect(workOrders.items[0].status).toBe('PENDING');
  });

  it('[C37] FetchWorkOrdersUseCase lists only the Organization work orders, with and without vesselId', async () => {
    workOrders.items.push(
      makeWorkOrder({ organizationId: 'A', vesselId: 'va' }, 'wa'),
      makeWorkOrder({ organizationId: 'B', vesselId: 'vb' }, 'wb'),
    );
    const sut = new FetchWorkOrdersUseCase(workOrders);

    const all = await sut.handle({ organizationId: 'A', take: 10, skip: 0 });
    const byVessel = await sut.handle({
      organizationId: 'A',
      vesselId: 'vb',
      take: 10,
      skip: 0,
    });

    expect(all.workOrders.map((workOrder) => workOrder.id)).toEqual(['wa']);
    expect(all.total).toBe(1);
    expect(byVessel.workOrders).toEqual([]);
    expect(byVessel.total).toBe(0);
  });

  it('[C37] the detail of a work order names its Vessel read through CustomerFacade', async () => {
    vessels.items[0].name = 'Aurora';
    workOrders.items.push(
      makeWorkOrder({ organizationId: 'A', vesselId: 'va' }, 'wa'),
    );

    const { workOrder } = await new GetWorkOrderByIdUseCase(
      workOrders,
      facade,
    ).handle({
      organizationId: 'A',
      id: 'wa',
    });

    expect(workOrder.vessel).toEqual({
      vesselId: 'va',
      name: 'Aurora',
      type: 'CARGO',
      length: 120,
    });
  });
});
