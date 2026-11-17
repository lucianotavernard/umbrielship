import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { PrismaCustomersRepository } from '../customer.repository.js';

describe('PrismaCustomersRepository', () => {
  it('customer-ui C13 asks for every customer with its vessel count when no page is given', async () => {
    const findMany = vi.fn(async (_args: unknown) => [
      {
        id: 'c1',
        organizationId: 'A',
        name: 'Atlantic',
        email: 'ops@atlantic.test',
        phone: null,
        address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
        _count: { vessels: 2 },
      },
    ]);
    const count = vi.fn(async (_args: unknown) => 1);
    const sut = new PrismaCustomersRepository({
      customer: { findMany, count },
    } as unknown as PrismaService);

    const result = await sut.findMany('A');

    expect(findMany).toHaveBeenCalledWith({
      include: { address: true, _count: { select: { vessels: true } } },
      where: { organizationId: 'A' },
      take: undefined,
      skip: undefined,
    });
    expect(count).toHaveBeenCalledWith({ where: { organizationId: 'A' } });
    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: 'c1',
      name: 'Atlantic',
      address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
      vesselCount: 2,
    });
    expect(result.data[0]).not.toHaveProperty('_count');
  });
});
