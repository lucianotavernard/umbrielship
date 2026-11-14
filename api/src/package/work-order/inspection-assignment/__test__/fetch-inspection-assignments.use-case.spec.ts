import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionAssignment, makeWorkOrder } from '@test/factory.js';
import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { FetchInspectionAssignmentsUseCase } from '../fetch-inspection-assignments.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let assignments: InMemoryInspectionAssignmentsRepository;
let sut: FetchInspectionAssignmentsUseCase;

describe('FetchInspectionAssignmentsUseCase', () => {
  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    assignments = new InMemoryInspectionAssignmentsRepository();
    sut = new FetchInspectionAssignmentsUseCase(workOrders, assignments);
    workOrders.items.push(
      makeWorkOrder({}, 'wo-1'),
      makeWorkOrder({}, 'wo-2'),
      makeWorkOrder({ organizationId: 'org-2' }, 'wo-foreign'),
    );
  });

  it("assignment C8 lists only the WorkOrder's assignments, newest first", async () => {
    assignments.items.push(
      makeInspectionAssignment(
        {
          workOrderId: 'wo-1',
          templateName: 'Antigo',
          createdAt: new Date(2026, 0, 1),
        },
        'a1',
      ),
      makeInspectionAssignment(
        {
          workOrderId: 'wo-1',
          templateName: 'Novo',
          createdAt: new Date(2026, 0, 3),
        },
        'a2',
      ),
      makeInspectionAssignment(
        {
          workOrderId: 'wo-2',
          templateName: 'Outra ordem',
          createdAt: new Date(2026, 0, 2),
        },
        'a3',
      ),
    );

    const { inspectionAssignments } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
    });
    expect(inspectionAssignments.map((item) => item.templateName)).toEqual([
      'Novo',
      'Antigo',
    ]);

    workOrders.items.push(makeWorkOrder({}, 'wo-empty'));
    expect(
      await sut.handle({ organizationId: 'org-1', workOrderId: 'wo-empty' }),
    ).toEqual({ inspectionAssignments: [] });
  });

  it('assignment C9 throws NotFoundDomainException for a foreign WorkOrder', async () => {
    await expect(
      sut.handle({ organizationId: 'org-1', workOrderId: 'wo-foreign' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(
      sut.handle({ organizationId: 'org-1', workOrderId: 'unknown' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
  });

  it('inspection C14 lists visible Inspections newest first and removable only without any', async () => {
    const inspections = new InMemoryInspectionsRepository(assignments);
    const make = (id: string, assignmentId: string, day: number) =>
      Inspection.create(
        {
          organizationId: 'org-1',
          assignmentId,
          result: 'APPROVED',
          inspectorId: 'user-9',
          inspectorName: 'Inês',
          answers: [],
          completedAt: new Date(2026, 0, day),
        },
        id,
      );
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a-inspected'),
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a-discarded-only'),
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a-fresh'),
    );
    const discarded = make('i-discarded', 'a-discarded-only', 4);
    discarded.discard('user-9');
    inspections.items.push(
      make('i-old', 'a-inspected', 1),
      make('i-new', 'a-inspected', 3),
      discarded,
    );

    const { inspectionAssignments } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
    });
    const byId = Object.fromEntries(
      inspectionAssignments.map((item) => [item.id, item]),
    );

    expect(byId['a-inspected'].inspections.map((item) => item.id)).toEqual([
      'i-new',
      'i-old',
    ]);
    expect(byId['a-discarded-only'].inspections).toEqual([]);
    expect(
      ['a-inspected', 'a-discarded-only', 'a-fresh'].map(
        (id) => byId[id].removable,
      ),
    ).toEqual([false, false, true]);
  });
});
