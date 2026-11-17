import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { PrismaVesselsRepository } from '../vessel.repository.js';

describe('PrismaVesselsRepository', () => {
  it('customer-ui C35 asks for every vessel when no page is given', async () => {
    const findMany = vi.fn(async (_args: unknown) => []);
    const count = vi.fn(async (_args: unknown) => 0);
    const sut = new PrismaVesselsRepository({
      vessel: { findMany, count },
    } as unknown as PrismaService);

    await sut.findMany('A');
    await sut.findManyByCustomerId('A', 'c1');

    expect(findMany).toHaveBeenNthCalledWith(1, {
      where: { organizationId: 'A' },
      take: undefined,
      skip: undefined,
    });
    expect(findMany).toHaveBeenNthCalledWith(2, {
      where: { organizationId: 'A', customerId: 'c1' },
      take: undefined,
      skip: undefined,
    });
  });
});
