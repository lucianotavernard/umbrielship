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

describe('FetchVesselsUseCase without a page', () => {
  it('customer-ui C35 returns every vessel of the Organization when no page is given', async () => {
    const vessels = new InMemoryVesselsRepository(
      new InMemoryCustomersRepository(),
    );
    for (let index = 1; index <= 14; index++) {
      vessels.items.push(
        makeVessel(
          {
            organizationId: 'A',
            customerId: index <= 3 ? 'c1' : 'c2',
            imoNumber: `${index}`,
          },
          `v${index}`,
        ),
      );
    }
    vessels.items.push(
      makeVessel({ organizationId: 'B', customerId: 'c1' }, 'b1'),
    );
    const sut = new FetchVesselsUseCase(vessels);

    const all = await sut.handle({ organizationId: 'A' });
    const ofCustomer = await sut.handle({
      organizationId: 'A',
      customerId: 'c1',
    });

    expect(all.vessels).toHaveLength(14);
    expect(all.total).toBe(14);
    expect(all.vessels.map((vessel) => vessel.id)).not.toContain('b1');
    expect(ofCustomer.vessels.map((vessel) => vessel.id)).toEqual([
      'v1',
      'v2',
      'v3',
    ]);
    expect(ofCustomer.total).toBe(3);
  });
});
