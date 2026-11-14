import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionAssignment, makeWorkOrder } from '@test/factory.js';
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
});
