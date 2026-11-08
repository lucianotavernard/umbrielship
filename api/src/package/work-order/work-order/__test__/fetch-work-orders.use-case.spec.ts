import { beforeEach, describe, expect, it } from 'vitest';

import { makeWorkOrder } from '@test/factory';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository';
import { FetchWorkOrdersUseCase } from '../fetch-work-orders.use-case';

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
});
