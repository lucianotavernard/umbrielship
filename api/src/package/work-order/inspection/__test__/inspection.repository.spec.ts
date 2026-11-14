import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { Inspection } from '../inspection.entity.js';
import { PrismaInspectionsRepository } from '../inspection.repository.js';

const fakePrisma = () => {
  const inspection = {
    count: vi.fn(async (_args: unknown) => 0),
    findFirst: vi.fn(async (_args: unknown) => null),
    create: vi.fn(async (_args: unknown) => ({})),
    updateMany: vi.fn(async (_args: unknown) => ({ count: 1 })),
  };
  return {
    inspection,
    sut: new PrismaInspectionsRepository({
      inspection,
    } as unknown as PrismaService),
  };
};

describe('PrismaInspectionsRepository', () => {
  it('inspection C34 counts every Inspection under a WorkOrder or a service, discarded ones included', async () => {
    const { inspection, sut } = fakePrisma();

    await sut.countByWorkOrderId('org-1', 'wo-1');
    await sut.countByServiceId('org-1', 'svc-1');

    expect(inspection.count.mock.calls.map(([args]) => args)).toEqual([
      {
        where: { organizationId: 'org-1', assignment: { workOrderId: 'wo-1' } },
      },
      {
        where: {
          organizationId: 'org-1',
          assignment: { workOrderServiceId: 'svc-1' },
        },
      },
    ]);
  });

  it('inspection C16 finds only a visible Inspection of the Organization', async () => {
    const { inspection, sut } = fakePrisma();

    expect(await sut.findVisibleById('org-1', 'i1')).toBeNull();

    expect(inspection.findFirst).toHaveBeenCalledWith({
      include: { answers: true },
      where: { id: 'i1', organizationId: 'org-1', discardedAt: null },
    });
  });

  it('inspection C7 writes each answer to the column of its value and marks a discard once', async () => {
    const { inspection, sut } = fakePrisma();
    const completed = Inspection.create(
      {
        organizationId: 'org-1',
        assignmentId: 'a1',
        result: 'REPROVED',
        inspectorId: 'user-9',
        inspectorName: 'Inês Prado',
        answers: [
          {
            itemId: 'q-text',
            notApplicable: false,
            value: 'Casco',
            note: null,
          },
          { itemId: 'q-yes', notApplicable: false, value: false, note: 'Alga' },
          { itemId: 'q-score', notApplicable: false, value: 0, note: null },
          { itemId: 'q-na', notApplicable: true, value: null, note: null },
        ],
      },
      'i1',
    );

    await sut.create(completed);

    const data = (
      inspection.create.mock.calls[0][0] as { data: Record<string, unknown> }
    ).data;
    expect(data).toMatchObject({
      id: 'i1',
      organizationId: 'org-1',
      assignmentId: 'a1',
      result: 'REPROVED',
      inspectorId: 'user-9',
      inspectorName: 'Inês Prado',
      completedAt: completed.completedAt,
    });
    expect(
      (data.answers as { create: Record<string, unknown>[] }).create.map(
        ({
          itemId,
          notApplicable,
          textValue,
          booleanValue,
          scoreValue,
          note,
          organizationId,
        }) => ({
          itemId,
          notApplicable,
          textValue,
          booleanValue,
          scoreValue,
          note,
          organizationId,
        }),
      ),
    ).toEqual([
      {
        itemId: 'q-text',
        notApplicable: false,
        textValue: 'Casco',
        booleanValue: null,
        scoreValue: null,
        note: null,
        organizationId: 'org-1',
      },
      {
        itemId: 'q-yes',
        notApplicable: false,
        textValue: null,
        booleanValue: false,
        scoreValue: null,
        note: 'Alga',
        organizationId: 'org-1',
      },
      {
        itemId: 'q-score',
        notApplicable: false,
        textValue: null,
        booleanValue: null,
        scoreValue: 0,
        note: null,
        organizationId: 'org-1',
      },
      {
        itemId: 'q-na',
        notApplicable: true,
        textValue: null,
        booleanValue: null,
        scoreValue: null,
        note: null,
        organizationId: 'org-1',
      },
    ]);

    completed.discard('user-7');
    await sut.saveDiscard(completed);
    expect(inspection.updateMany).toHaveBeenCalledWith({
      where: { id: 'i1', organizationId: 'org-1', discardedAt: null },
      data: { discardedAt: completed.discardedAt, discardedBy: 'user-7' },
    });
  });
});
