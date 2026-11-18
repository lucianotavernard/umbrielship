import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { PrismaTeamsRepository } from '../team.repository.js';

describe('PrismaTeamsRepository', () => {
  it('workforce C6 reads the teams with their staff count', async () => {
    const findMany = vi.fn(async (_args: unknown) => [
      {
        id: 'bravo',
        organizationId: 'A',
        name: 'Equipe Bravo',
        specialty: 'Hidráulica',
        createdAt: new Date(),
        _count: { staff: 3 },
      },
    ]);
    const sut = new PrismaTeamsRepository({
      team: { findMany },
    } as unknown as PrismaService);

    const teams = await sut.findMany('A');

    expect(findMany).toHaveBeenCalledWith({
      where: { organizationId: 'A' },
      include: { _count: { select: { staff: true } } },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    expect(teams).toHaveLength(1);
    expect(teams[0].staffCount).toBe(3);
    expect(teams[0].team).toMatchObject({
      id: 'bravo',
      name: 'Equipe Bravo',
      specialty: 'Hidráulica',
    });
    expect(teams[0].team).not.toHaveProperty('_count');
  });
});
