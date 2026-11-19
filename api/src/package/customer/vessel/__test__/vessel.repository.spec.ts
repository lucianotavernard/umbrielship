import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeVessel } from '@test/factory.js';
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

  it('writes the status on create and on save', async () => {
    const create = vi.fn(async (_args: unknown) => ({}));
    const update = vi.fn(async (_args: unknown) => ({}));
    const sut = new PrismaVesselsRepository({ vessel: { create, update } } as unknown as PrismaService);

    await sut.create(makeVessel({ status: 'MAINTENANCE' }, 'v1'));
    await sut.save(makeVessel({ status: 'INACTIVE', name: 'Nova' }, 'v1'));

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'v1', status: 'MAINTENANCE' }),
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { name: 'Nova', type: 'CARGO', length: 120, status: 'INACTIVE' },
    });
  });

  it('reads the status of each stored vessel', async () => {
    const row = (id: string, status: string) => ({
      id,
      organizationId: 'org-1',
      customerId: 'c1',
      imoNumber: id,
      name: id,
      type: 'CARGO',
      length: 10,
      status,
    });
    const findMany = vi.fn(async (_args: unknown) => [row('v1', 'ACTIVE'), row('v2', 'INACTIVE')]);
    const count = vi.fn(async (_args: unknown) => 2);
    const sut = new PrismaVesselsRepository({ vessel: { findMany, count } } as unknown as PrismaService);

    const result = await sut.findMany('org-1');

    expect(result.data.map((vessel) => [vessel.id, vessel.status])).toEqual([
      ['v1', 'ACTIVE'],
      ['v2', 'INACTIVE'],
    ]);
  });
});
