import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel, makeWorkOrder } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderServiceUseCase } from '../create-work-order-service.use-case.js';
import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';

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
    sut = new CreateWorkOrderServiceUseCase(
      workOrders,
      services,
      inMemoryWorkforce().facade,
    );
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

describe('CreateWorkOrderServiceUseCase', () => {
  const setup = (
    status:
      | 'PENDING'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED' = 'IN_PROGRESS',
  ) => {
    const workOrders = new InMemoryWorkOrdersRepository();
    const workforce = inMemoryWorkforce();
    workOrders.items.push(
      makeWorkOrder({ organizationId: 'A', status }, 'wo1'),
    );
    workforce.staff.items.push(makeStaff({ organizationId: 'A' }, 'rafael'));
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'alfa'));
    const sut = new CreateWorkOrderServiceUseCase(
      workOrders,
      workOrders.services,
      workforce.facade,
    );
    return { workOrders, workforce, sut };
  };

  it('workforce C23 assigns the new service', async () => {
    const { workforce, sut } = setup();

    const { service } = await sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...input,
      teamId: 'alfa',
    });

    expect(workforce.assignments.items).toEqual([
      expect.objectContaining({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: service.id,
        staffId: null,
        teamId: 'alfa',
      }),
    ]);
  });

  it('workforce C23 stores nothing for an assignee on a completed service', async () => {
    const { workOrders, workforce, sut } = setup();

    const promise = sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...input,
      status: 'COMPLETED',
      staffId: 'rafael',
    });
    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Work order service is not open');

    const closed = setup('CANCELLED');
    await expect(
      closed.sut.handle({
        organizationId: 'A',
        workOrderId: 'wo1',
        ...input,
        staffId: 'rafael',
      }),
    ).rejects.toThrow('Work order service is not open');

    const unknown = sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...input,
      staffId: '00000000-0000-4000-8000-000000000000',
    });
    await expect(unknown).rejects.toThrow('Staff not found');

    expect(workOrders.services.items).toHaveLength(0);
    expect(closed.workOrders.services.items).toHaveLength(0);
    expect(workforce.assignments.items).toHaveLength(0);
  });
});
