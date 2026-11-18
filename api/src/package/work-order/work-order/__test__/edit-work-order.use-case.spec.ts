import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel, makeWorkOrder } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { EditWorkOrderUseCase } from '../edit-work-order.use-case.js';
import {
  inMemoryWorkforce,
  makeAssignment,
  makeStaff,
  makeTeam,
} from '@test/workforce.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { makeService } from '@test/factory.js';

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
    workOrders = new InMemoryWorkOrdersRepository();
    sut = new EditWorkOrderUseCase(
      workOrders,
      new InMemoryWorkOrderServicesRepository(),
      inMemoryWorkforce().facade,
    );
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
  });

  it('[C21] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      workOrderId: 'missing',
      ...input,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });

  it('[C21] saves the new dates and status under the same id', async () => {
    workOrders.items.push(
      makeWorkOrder({ vesselId: 'vessel-1', status: 'PENDING' }, 'wo1'),
    );

    await sut.handle({ organizationId: 'org-1', workOrderId: 'wo1', ...input });

    expect(workOrders.items).toHaveLength(1);
    expect(workOrders.items[0]).toMatchObject({
      id: 'wo1',
      ...input,
    });
  });
});

describe('EditWorkOrderUseCase', () => {
  const period = {
    startDate: new Date('2026-11-17T09:00:00.000Z'),
    endDate: new Date('2026-11-20T17:00:00.000Z'),
  };
  const setup = () => {
    const workOrders = new InMemoryWorkOrdersRepository();
    const workforce = inMemoryWorkforce();
    workOrders.items.push(
      makeWorkOrder({ organizationId: 'A', status: 'IN_PROGRESS' }, 'wo1'),
      makeWorkOrder({ organizationId: 'A', status: 'IN_PROGRESS' }, 'wo2'),
    );
    workOrders.services.items.push(
      makeService(
        {
          organizationId: 'A',
          workOrderId: 'wo1',
          name: 'Pintura',
          status: 'IN_PROGRESS',
        },
        's1',
      ),
      makeService(
        {
          organizationId: 'A',
          workOrderId: 'wo1',
          name: 'Motor',
          status: 'PENDING',
        },
        's2',
      ),
      makeService(
        {
          organizationId: 'A',
          workOrderId: 'wo1',
          name: 'Limpeza',
          status: 'COMPLETED',
        },
        's3',
      ),
      makeService(
        {
          organizationId: 'A',
          workOrderId: 'wo2',
          name: 'Outro',
          status: 'PENDING',
        },
        's9',
      ),
    );
    workforce.staff.items.push(
      makeStaff(
        { organizationId: 'A', name: 'A', email: 'a@x.test' },
        'staff-a',
      ),
      makeStaff(
        { organizationId: 'A', name: 'B', email: 'b@x.test' },
        'staff-b',
      ),
    );
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'alfa'));
    workforce.assignments.items.push(
      makeAssignment({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's1',
        staffId: 'staff-a',
      }),
      makeAssignment({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's2',
        staffId: 'staff-b',
      }),
      makeAssignment({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's3',
        staffId: 'staff-a',
      }),
    );
    const sut = new EditWorkOrderUseCase(
      workOrders,
      workOrders.services,
      workforce.facade,
    );
    const assigneeOf = (serviceId: string) => {
      const item = workforce.assignments.items.find(
        (a) => a.workOrderServiceId === serviceId,
      );
      return item ? (item.staffId ?? `team:${item.teamId}`) : null;
    };
    return { workOrders, workforce, sut, assigneeOf };
  };

  it('workforce C22 replaces, clears and keeps the assignees', async () => {
    const { workforce, sut, assigneeOf } = setup();

    await sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...period,
      status: 'IN_PROGRESS',
      services: [{ id: 's1', teamId: 'alfa' }, { id: 's2' }],
    });

    expect(assigneeOf('s1')).toBe('team:alfa');
    expect(assigneeOf('s2')).toBeNull();
    expect(assigneeOf('s3')).toBe('staff-a');
    expect(workforce.assignments.items).toHaveLength(2);
  });

  it('workforce C22 keeps the same assignee and refuses another on a completed service', async () => {
    const { sut, assigneeOf } = setup();
    const edit = (services: { id: string; staffId?: string }[]) =>
      sut.handle({
        organizationId: 'A',
        workOrderId: 'wo1',
        ...period,
        status: 'IN_PROGRESS',
        services,
      });

    await edit([{ id: 's3', staffId: 'staff-a' }]);
    expect(assigneeOf('s3')).toBe('staff-a');

    const other = edit([{ id: 's3', staffId: 'staff-b' }]);
    await expect(other).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(other).rejects.toThrow('Work order service is not open');
    expect(assigneeOf('s3')).toBe('staff-a');

    await edit([{ id: 's3' }]);
    expect(assigneeOf('s3')).toBeNull();
  });

  it('workforce C22 changes nothing when a cancelled work order gets a new assignee', async () => {
    const { workOrders, sut, assigneeOf } = setup();

    const promise = sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...period,
      status: 'CANCELLED',
      services: [{ id: 's2', teamId: 'alfa' }],
    });

    await expect(promise).rejects.toThrow('Work order service is not open');
    expect(workOrders.items.find((item) => item.id === 'wo1')!.status).toBe(
      'IN_PROGRESS',
    );
    expect(assigneeOf('s2')).toBe('staff-b');
  });

  it('workforce C22 answers service not found for a service of another work order', async () => {
    const { workOrders, sut, assigneeOf } = setup();

    const promise = sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      ...period,
      status: 'PENDING',
      services: [{ id: 's1' }, { id: 's9', staffId: 'staff-a' }],
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(assigneeOf('s1')).toBe('staff-a');
    expect(workOrders.items.find((item) => item.id === 'wo1')!.status).toBe(
      'IN_PROGRESS',
    );
  });
});
