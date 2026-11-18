import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeAssignment } from '@test/workforce.js';
import { PrismaAssignmentsRepository } from '../assignment.repository.js';

describe('PrismaAssignmentsRepository', () => {
  it('workforce C19 writes one assignment per service', async () => {
    const upsert = vi.fn(async (_args: unknown) => ({}));
    const sut = new PrismaAssignmentsRepository({
      assignment: { upsert },
    } as unknown as PrismaService);

    await sut.put(
      makeAssignment(
        {
          organizationId: 'A',
          workOrderId: 'wo1',
          workOrderServiceId: 's1',
          staffId: null,
          teamId: 'alfa',
        },
        'a1',
      ),
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { workOrderServiceId: 's1' },
      create: {
        id: 'a1',
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's1',
        staffId: null,
        teamId: 'alfa',
      },
      update: { staffId: null, teamId: 'alfa' },
    });
  });
});
