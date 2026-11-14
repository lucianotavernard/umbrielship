import { describe, expect, it, vi } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
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
        inspections: [],
        _count: { inspections: 0 },
        items: [
          {
            id: 'i2',
            organizationId: 'org-1',
            assignmentId: 'a1',
            label: 'B',
            position: 1,
            type: 'CONFORMITY',
          },
          {
            id: 'i1',
            organizationId: 'org-1',
            assignmentId: 'a1',
            label: 'A',
            position: 0,
            type: 'CONFORMITY',
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
        inspections: {
          where: { discardedAt: null },
          orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
          include: { answers: true },
        },
        _count: { select: { inspections: true } },
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
              type: 'CONFORMITY',
            },
            {
              id: assignment.items[1].id,
              organizationId: 'org-1',
              label: 'B',
              position: 1,
              type: 'CONFORMITY',
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

  it('assignment C6 turns a target deleted mid-assign into NotFoundDomainException', async () => {
    const create = vi
      .fn(async (_args: unknown) => ({}))
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Foreign key constraint violated',
          {
            code: 'P2003',
            clientVersion: '7',
          },
        ),
      )
      .mockRejectedValueOnce(new Error('down'));
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { create },
    } as unknown as PrismaService);

    await expect(sut.create(makeInspectionAssignment())).rejects.toBeInstanceOf(
      NotFoundDomainException,
    );
    await expect(sut.create(makeInspectionAssignment())).rejects.toThrow(
      'down',
    );
  });

  it('inspection C14 reads visible Inspections newest first and counts every Inspection for removable', async () => {
    const answer = (itemId: string, extra: object) => ({
      id: `ans-${itemId}`,
      organizationId: 'org-1',
      inspectionId: 'i2',
      itemId,
      notApplicable: false,
      textValue: null,
      booleanValue: null,
      scoreValue: null,
      note: null,
      ...extra,
    });
    const findMany = vi.fn(async (_args: unknown) => [
      {
        id: 'a1',
        organizationId: 'org-1',
        workOrderId: 'wo-1',
        workOrderServiceId: null,
        templateName: 'Pintura',
        assignedBy: 'user-1',
        createdAt: new Date(2026, 0, 1),
        workOrderService: null,
        items: [],
        inspections: [
          {
            id: 'i2',
            organizationId: 'org-1',
            assignmentId: 'a1',
            result: 'REPROVED',
            inspectorId: 'user-9',
            inspectorName: 'Inês',
            completedAt: new Date(2026, 0, 3),
            discardedAt: null,
            discardedBy: null,
            answers: [
              answer('q-text', { textValue: 'Casco' }),
              answer('q-yes', { booleanValue: false }),
              answer('q-score', { scoreValue: 0, note: 'Sujo' }),
              answer('q-na', { notApplicable: true }),
            ],
          },
        ],
        _count: { inspections: 3 },
      },
    ]);
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { findMany },
    } as unknown as PrismaService);

    const [assignment] = await sut.findManyByWorkOrderId('org-1', 'wo-1');

    expect(findMany.mock.calls[0][0]).toMatchObject({
      include: {
        inspections: {
          where: { discardedAt: null },
          orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
        },
        _count: { select: { inspections: true } },
      },
    });
    expect(assignment.removable).toBe(false);
    expect(assignment.inspectionCount).toBe(3);
    expect(
      assignment.inspections[0].answers.map(
        ({ itemId, notApplicable, value, note }) => [
          itemId,
          notApplicable,
          value,
          note,
        ],
      ),
    ).toEqual([
      ['q-text', false, 'Casco', null],
      ['q-yes', false, false, null],
      ['q-score', false, 0, 'Sujo'],
      ['q-na', true, null, null],
    ]);
  });

  it('inspection C19 turns the database refusal into ConflictDomainException', async () => {
    const deleteMany = vi
      .fn(async (_args: unknown) => ({ count: 1 }))
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Foreign key constraint violated',
          {
            code: 'P2003',
            clientVersion: '7',
          },
        ),
      );
    const sut = new PrismaInspectionAssignmentsRepository({
      inspectionAssignment: { deleteMany },
    } as unknown as PrismaService);

    await expect(sut.delete('org-1', 'a1')).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
  });
});
