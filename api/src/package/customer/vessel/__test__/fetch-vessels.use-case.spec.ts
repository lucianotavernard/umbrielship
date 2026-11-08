import { beforeEach, describe, expect, it } from 'vitest';

import { makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { FetchVesselsUseCase } from '../fetch-vessels.use-case.js';

let vessels: InMemoryVesselsRepository;
let sut: FetchVesselsUseCase;

describe('FetchVesselsUseCase', () => {
  beforeEach(() => {
    vessels = new InMemoryVesselsRepository(new InMemoryCustomersRepository());
    sut = new FetchVesselsUseCase(vessels);
    vessels.items.push(
      makeVessel({ customerId: 'c1', imoNumber: '1' }, 'v1'),
      makeVessel({ customerId: 'c2', imoNumber: '2' }, 'v2'),
      makeVessel({ customerId: 'c1', imoNumber: '3' }, 'v3'),
      makeVessel({ customerId: 'c1', imoNumber: '4' }, 'v4'),
    );
  });

  it("[C13] returns only the customer's vessels and their count as total", async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      take: 10,
      skip: 0,
    });

    expect(result.vessels.map((vessel) => vessel.id)).toEqual([
      'v1',
      'v3',
      'v4',
    ]);
    expect(result.total).toBe(3);
  });

  it('[C13] applies take and skip within the customer', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      customerId: 'c1',
      take: 1,
      skip: 1,
    });

    expect(result.vessels.map((vessel) => vessel.id)).toEqual(['v3']);
    expect(result.total).toBe(3);
  });

  it('[C13] returns every vessel without a customerId', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      take: 10,
      skip: 0,
    });

    expect(result.vessels).toHaveLength(4);
    expect(result.total).toBe(4);
  });

  it('[C13] applies take and skip over every vessel', async () => {
    const result = await sut.handle({
      organizationId: 'org-1',
      take: 2,
      skip: 2,
    });

    expect(result.vessels.map((vessel) => vessel.id)).toEqual(['v3', 'v4']);
    expect(result.total).toBe(4);
  });
});
