import { beforeEach, describe, expect, it } from 'vitest';

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderUseCase } from '../create-work-order.use-case.js';
import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';

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
    sut = new CreateWorkOrderUseCase(
      workOrders,
      new CustomerFacade(vessels),
      inMemoryWorkforce().facade,
    );
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

  it('work-order-ui C21 creates the services pending with the work order period', async () => {
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'v1'));

    const { workOrder } = await sut.handle({
      organizationId: 'org-1',
      vesselId: 'v1',
      status: 'IN_PROGRESS',
      ...dates,
      services: [
        { name: 'Pintura do casco', description: 'Lixar e pintar' },
        { name: 'Motor', description: 'Revisão geral' },
      ],
    });

    expect(workOrders.items).toEqual([workOrder]);
    expect(
      workOrders.services.items.map(
        ({ organizationId, workOrderId, name, description, ...rest }) => ({
          organizationId,
          workOrderId,
          name,
          description,
          startDate: rest.startDate,
          endDate: rest.endDate,
          status: rest.status,
        }),
      ),
    ).toEqual([
      {
        organizationId: 'org-1',
        workOrderId: workOrder.id,
        name: 'Pintura do casco',
        description: 'Lixar e pintar',
        ...dates,
        status: 'PENDING',
      },
      {
        organizationId: 'org-1',
        workOrderId: workOrder.id,
        name: 'Motor',
        description: 'Revisão geral',
        ...dates,
        status: 'PENDING',
      },
    ]);
    const [first, second] = workOrders.services.items;
    expect(first.id).not.toBe(second.id);

    // No services: the WorkOrder alone, as before.
    const alone = await sut.handle({
      organizationId: 'org-1',
      vesselId: 'v1',
      status: 'PENDING',
      ...dates,
    });
    expect(workOrders.items).toHaveLength(2);
    expect(workOrders.services.items).toHaveLength(2);
    expect(
      workOrders.services.items.filter(
        (item) => item.workOrderId === alone.workOrder.id,
      ),
    ).toEqual([]);
  });

  it('work-order-ui C21 stores nothing when the vessel is of another organization', async () => {
    vessels.items.push(
      makeVessel({ organizationId: 'org-2', customerId: 'customer-1' }, 'v2'),
    );

    const promise = sut.handle({
      organizationId: 'org-1',
      vesselId: 'v2',
      status: 'PENDING',
      ...dates,
      services: [{ name: 'Pintura', description: 'Casco' }],
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Vessel not found');
    expect(workOrders.items).toEqual([]);
    expect(workOrders.services.items).toEqual([]);
  });
});

describe('CreateWorkOrderUseCase', () => {
  const setup = () => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    const workOrders = new InMemoryWorkOrdersRepository();
    const workforce = inMemoryWorkforce();
    customers.items.push(makeCustomer({ organizationId: 'A' }, 'customer-a'));
    vessels.items.push(
      makeVessel({ organizationId: 'A', customerId: 'customer-a' }, 'vessel-a'),
    );
    workforce.staff.items.push(makeStaff({ organizationId: 'A' }, 'rafael'));
    workforce.staff.items.push(
      makeStaff({ organizationId: 'B', email: 'b@x.test' }, 'stranger'),
    );
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'alfa'));
    workforce.teams.items.push(makeTeam({ organizationId: 'B' }, 'zulu'));
    const sut = new CreateWorkOrderUseCase(
      workOrders,
      new CustomerFacade(vessels),
      workforce.facade,
    );
    return { workOrders, workforce, sut };
  };
  const base = {
    organizationId: 'A',
    vesselId: 'vessel-a',
    startDate: new Date('2026-11-17T09:00:00.000Z'),
    endDate: new Date('2026-11-20T17:00:00.000Z'),
  };

  it('workforce C19 assigns the staff and the team of each service', async () => {
    const { workOrders, workforce, sut } = setup();

    const { workOrder } = await sut.handle({
      ...base,
      status: 'IN_PROGRESS',
      services: [
        { name: 'Pintura', description: 'Casco', staffId: 'rafael' },
        { name: 'Motor', description: 'Revisão', teamId: 'alfa' },
        { name: 'Limpeza', description: 'Convés' },
      ],
    });

    const [pintura, motor, limpeza] = ['Pintura', 'Motor', 'Limpeza'].map(
      (name) =>
        workOrders.services.items.find((service) => service.name === name)!,
    );
    expect(workforce.assignments.items).toHaveLength(2);
    expect(workforce.assignments.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organizationId: 'A',
          workOrderId: workOrder.id,
          workOrderServiceId: pintura.id,
          staffId: 'rafael',
          teamId: null,
        }),
        expect.objectContaining({
          workOrderId: workOrder.id,
          workOrderServiceId: motor.id,
          staffId: null,
          teamId: 'alfa',
        }),
      ]),
    );
    expect(
      workforce.assignments.items.some(
        (item) => item.workOrderServiceId === limpeza.id,
      ),
    ).toBe(false);
  });

  it('workforce C20 stores nothing for a staff of another organization', async () => {
    const { workOrders, workforce, sut } = setup();

    const promise = sut.handle({
      ...base,
      status: 'PENDING',
      services: [
        { name: 'Pintura', description: 'Casco', staffId: 'stranger' },
      ],
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Staff not found');
    expect(workOrders.items).toHaveLength(0);
    expect(workOrders.services.items).toHaveLength(0);
    expect(workforce.assignments.items).toHaveLength(0);
  });

  it('workforce C20 stores nothing for an assignee on a closed work order', async () => {
    const { workOrders, workforce, sut } = setup();

    for (const status of ['COMPLETED', 'CANCELLED'] as const) {
      const promise = sut.handle({
        ...base,
        status,
        services: [{ name: 'Pintura', description: 'Casco', teamId: 'alfa' }],
      });

      await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
      await expect(promise).rejects.toThrow('Work order service is not open');
    }
    expect(workOrders.items).toHaveLength(0);
    expect(workforce.assignments.items).toHaveLength(0);

    await sut.handle({
      ...base,
      status: 'COMPLETED',
      services: [{ name: 'Pintura', description: 'Casco' }],
    });
    expect(workOrders.items).toHaveLength(1);
  });

  it('workforce C40 validates every assignee before writing anything', async () => {
    const { workOrders, workforce, sut } = setup();

    const promise = sut.handle({
      ...base,
      status: 'PENDING',
      services: [
        { name: 'Pintura', description: 'Casco', staffId: 'rafael' },
        { name: 'Motor', description: 'Revisão', teamId: 'zulu' },
      ],
    });

    await expect(promise).rejects.toThrow('Team not found');
    expect(workOrders.items).toHaveLength(0);
    expect(workOrders.services.items).toHaveLength(0);
    expect(workforce.assignments.items).toHaveLength(0);
  });
});
