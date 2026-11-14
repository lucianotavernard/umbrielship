import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeInspectionAssignment } from '@test/factory.js';
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

  it('assignment C2 writes the target service, the copied items and the Organization', async () => {
    const create = vi.fn(async (_args: unknown) => ({}));
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { create },
    } as unknown as PrismaService);
    const assignment = makeInspectionAssignment(
      {
        workOrderId: 'wo-1',
        service: { id: 'svc-1', name: 'Pintura' },
        templateName: 'Pintura do casco',
        labels: ['A', 'B'],
        assignedBy: 'user-9',
      },
      'a1',
    );

    await sut.create(assignment);

    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'a1',
        organizationId: 'org-1',
        workOrderId: 'wo-1',
        workOrderServiceId: 'svc-1',
        templateName: 'Pintura do casco',
        assignedBy: 'user-9',
        createdAt: assignment.createdAt,
        items: {
          create: [
            {
              id: assignment.items[0].id,
              organizationId: 'org-1',
              label: 'A',
              position: 0,
            },
            {
              id: assignment.items[1].id,
              organizationId: 'org-1',
              label: 'B',
              position: 1,
            },
          ],
        },
      },
    });

    await sut.create(makeInspectionAssignment({ service: null }, 'a2'));
    expect(create.mock.calls[1][0]).toMatchObject({
      data: { workOrderServiceId: null },
    });
  });

  it('assignment C11 reads and deletes an assignment only inside its Organization', async () => {
    const findFirst = vi.fn(async (_args: unknown) => null);
    const deleteMany = vi.fn(async (_args: unknown) => ({ count: 1 }));
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { findFirst, deleteMany },
    } as unknown as PrismaService);

    expect(await sut.findById('org-1', 'a1')).toBeNull();
    await sut.delete('org-1', 'a1');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'a1', organizationId: 'org-1' } }),
    );
    expect(deleteMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', id: 'a1' },
    });
  });
});
