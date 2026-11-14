import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { PrismaInspectionAssignmentsRepository } from '../inspection-assignment.repository.js';

describe('PrismaInspectionAssignmentsRepository', () => {
  it("assignment C8 asks for the WorkOrder's assignments newest first with items by position and the service name", async () => {
    const findMany = vi.fn(async (_args: unknown) => [
      {
        id: 'a1',
        organizationId: 'org-1',
        workOrderId: 'wo-1',
        workOrderServiceId: 'svc-1',
        templateName: 'Pintura',
        assignedBy: 'user-1',
        createdAt: new Date(2026, 0, 1),
        workOrderService: { id: 'svc-1', name: 'Pintura do casco' },
        items: [
          {
            id: 'i2',
            organizationId: 'org-1',
            assignmentId: 'a1',
            label: 'B',
            position: 1,
          },
          {
            id: 'i1',
            organizationId: 'org-1',
            assignmentId: 'a1',
            label: 'A',
            position: 0,
          },
        ],
      },
    ]);
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { findMany },
    } as unknown as PrismaService);

    const [assignment] = await sut.findManyByWorkOrderId('org-1', 'wo-1');

    expect(findMany).toHaveBeenCalledWith({
      include: {
        items: { orderBy: { position: 'asc' } },
        workOrderService: { select: { id: true, name: true } },
      },
      where: { organizationId: 'org-1', workOrderId: 'wo-1' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    expect(assignment.service).toEqual({
      id: 'svc-1',
      name: 'Pintura do casco',
    });
    expect(assignment.items.map((item) => item.label)).toEqual(['A', 'B']);
  });
});
