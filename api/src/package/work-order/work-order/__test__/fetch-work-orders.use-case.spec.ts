import { beforeEach, describe, expect, it } from 'vitest';

import { makeService, makeWorkOrder } from '@test/factory.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { FetchWorkOrdersUseCase } from '../fetch-work-orders.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let sut: FetchWorkOrdersUseCase;

describe('FetchWorkOrdersUseCase', () => {
  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    sut = new FetchWorkOrdersUseCase(workOrders);
    workOrders.items.push(
      makeWorkOrder({ vesselId: 'v1' }, 'w1'),
      makeWorkOrder({ vesselId: 'v2' }, 'w2'),
      makeWorkOrder({ vesselId: 'v1' }, 'w3'),
      makeWorkOrder({ vesselId: 'v1' }, 'w4'),
    );
  });

  it("[C25] returns only the vessel's work orders and their count as total", async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      vesselId: 'v1',
      take: 10,
      skip: 0,
    });

    expect(result.workOrders.map((item) => item.id)).toEqual([
      'w1',
      'w3',
      'w4',
    ]);
    expect(result.total).toBe(3);
  });

  it('[C25] applies take and skip within the vessel', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      vesselId: 'v1',
      take: 1,
      skip: 1,
    });

    expect(result.workOrders.map((item) => item.id)).toEqual(['w3']);
    expect(result.total).toBe(3);
  });

  it('[C25] returns every work order without a vesselId', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      take: 10,
      skip: 0,
    });

    expect(result.workOrders).toHaveLength(4);
    expect(result.total).toBe(4);
  });

  it('[C25] applies take and skip over every work order', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      take: 2,
      skip: 2,
    });

    expect(result.workOrders.map((item) => item.id)).toEqual(['w3', 'w4']);
    expect(result.total).toBe(4);
  });

  it('work-order-ui C2 returns every work order of the Organization when no take is given', async () => {
    const repository = new InMemoryWorkOrdersRepository();
    const fetch = new FetchWorkOrdersUseCase(repository);
    for (let index = 1; index <= 14; index++) {
      repository.items.push(
        makeWorkOrder({ vesselId: index <= 5 ? 'v1' : 'v2' }, `wo-${index}`),
      );
    }
    repository.items.push(
      makeWorkOrder({ organizationId: 'org-2', vesselId: 'v1' }, 'wo-other'),
    );
    repository.services.items.push(
      makeService(
        {
          workOrderId: 'wo-1',
          name: 'Pintura',
          startDate: new Date('2026-06-10T00:00:00.000Z'),
        },
        's-pintura',
      ),
      makeService(
        {
          workOrderId: 'wo-1',
          name: 'Motor',
          startDate: new Date('2026-06-02T00:00:00.000Z'),
        },
        's-motor',
      ),
    );

    const all = await fetch.handle({ organizationId: 'org-1' });

    expect(all.total).toBe(14);
    expect(all.workOrders.map((item) => item.id)).toEqual(
      Array.from({ length: 14 }, (_, index) => `wo-${index + 1}`),
    );
    expect(all.workOrders[0].services.map((item) => item.name)).toEqual([
      'Motor',
      'Pintura',
    ]);
    expect(all.workOrders[1].services).toEqual([]);

    const paged = await fetch.handle({
      organizationId: 'org-1',
      take: 10,
      skip: 0,
    });
    expect(paged.workOrders).toHaveLength(10);
    expect(paged.total).toBe(14);

    const byVessel = await fetch.handle({
      organizationId: 'org-1',
      vesselId: 'v1',
    });
    expect(byVessel.workOrders.map((item) => item.id)).toEqual([
      'wo-1',
      'wo-2',
      'wo-3',
      'wo-4',
      'wo-5',
    ]);
    expect(byVessel.total).toBe(5);
  });
});
