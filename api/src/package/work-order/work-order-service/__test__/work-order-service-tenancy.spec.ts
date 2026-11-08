import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeService, makeWorkOrder } from '@test/factory.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderServiceUseCase } from '../create-work-order-service.use-case.js';
import { DeleteWorkOrderServiceUseCase } from '../delete-work-order-service.use-case.js';
import { EditWorkOrderServiceUseCase } from '../edit-work-order-service.use-case.js';
import { FetchWorkOrderServicesUseCase } from '../fetch-work-order-services.use-case.js';
import { GetWorkOrderServiceByIdUseCase } from '../get-work-order-service-by-id.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let services: InMemoryWorkOrderServicesRepository;

const body = {
  name: 'Paint',
  description: 'Hull',
  startDate: new Date('2026-02-01T00:00:00.000Z'),
  endDate: new Date('2026-02-02T00:00:00.000Z'),
  status: 'PENDING' as const,
};

describe('WorkOrderService tenancy', () => {
  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    services = new InMemoryWorkOrderServicesRepository();
    workOrders.items.push(makeWorkOrder({ organizationId: 'B' }, 'wb'));
    services.items.push(
      makeService(
        { organizationId: 'B', workOrderId: 'wb', name: 'Keep' },
        'sb',
      ),
    );
  });

  it('[C38] every use case answers not found for a work order or service of another Organization', async () => {
    const create = new CreateWorkOrderServiceUseCase(
      workOrders,
      services,
    ).handle({
      organizationId: 'A',
      workOrderId: 'wb',
      ...body,
    });
    const fetch = new FetchWorkOrderServicesUseCase(
      workOrders,
      services,
    ).handle({
      organizationId: 'A',
      workOrderId: 'wb',
    });
    const get = new GetWorkOrderServiceByIdUseCase(services).handle({
      organizationId: 'A',
      workOrderId: 'wb',
      serviceId: 'sb',
    });
    const edit = new EditWorkOrderServiceUseCase(services).handle({
      organizationId: 'A',
      workOrderId: 'wb',
      serviceId: 'sb',
      ...body,
    });
    const remove = new DeleteWorkOrderServiceUseCase(services).handle({
      organizationId: 'A',
      workOrderId: 'wb',
      serviceId: 'sb',
    });

    await expect(create).rejects.toThrow('Work order not found');
    await expect(fetch).rejects.toThrow('Work order not found');
    for (const promise of [get, edit, remove]) {
      await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
      await expect(promise).rejects.toThrow('Work order service not found');
    }
    expect(services.items).toHaveLength(1);
    expect(services.items[0].name).toBe('Keep');
  });
});
