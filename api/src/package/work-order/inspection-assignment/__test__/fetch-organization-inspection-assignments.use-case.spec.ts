import { describe, expect, it } from 'vitest';

import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';

import {
  makeInspectionAssignment,
  makeService,
  makeWorkOrder,
} from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { FetchOrganizationInspectionAssignmentsUseCase } from '../fetch-organization-inspection-assignments.use-case.js';

const inspectionOf = (
  assignmentId: string,
  id: string,
  completedAt: Date,
  discarded = false,
) =>
  Inspection.restore(
    {
      organizationId: 'org-1',
      assignmentId,
      result: 'APPROVED',
      inspectorId: 'user-9',
      inspectorName: 'Inês',
      completedAt,
      discardedAt: discarded ? new Date(2026, 0, 20) : null,
      discardedBy: discarded ? 'user-9' : null,
      answers: [],
    },
    id,
  );

describe('FetchOrganizationInspectionAssignmentsUseCase', () => {
  it('work-order-ui C34 returns every assignment of the Organization and no other', async () => {
    const workOrders = new InMemoryWorkOrdersRepository();
    const assignments = new InMemoryInspectionAssignmentsRepository(workOrders);
    const inspections = new InMemoryInspectionsRepository(assignments);
    const sut = new FetchOrganizationInspectionAssignmentsUseCase(assignments);
    workOrders.items.push(
      makeWorkOrder({ vesselId: 'v1', status: 'PENDING' }, 'wo-1'),
      makeWorkOrder({ vesselId: 'v2', status: 'IN_PROGRESS' }, 'wo-2'),
      makeWorkOrder({ organizationId: 'org-2', vesselId: 'v9' }, 'wo-other'),
    );
    workOrders.services.items.push(
      makeService(
        { workOrderId: 'wo-2', name: 'Pintura', status: 'IN_PROGRESS' },
        's1',
      ),
    );
    assignments.items.push(
      makeInspectionAssignment(
        { workOrderId: 'wo-1', createdAt: new Date(2026, 0, 1) },
        'a1',
      ),
      makeInspectionAssignment(
        {
          workOrderId: 'wo-2',
          service: { id: 's1', name: 'Pintura' },
          createdAt: new Date(2026, 0, 3),
        },
        'a2',
      ),
      makeInspectionAssignment(
        { workOrderId: 'wo-1', createdAt: new Date(2026, 0, 2) },
        'a3',
      ),
      makeInspectionAssignment(
        {
          organizationId: 'org-2',
          workOrderId: 'wo-other',
          createdAt: new Date(2026, 0, 9),
        },
        'a-other',
      ),
    );
    inspections.items.push(
      inspectionOf('a2', 'i-old', new Date(2026, 0, 4)),
      inspectionOf('a2', 'i-new', new Date(2026, 0, 6)),
      inspectionOf('a3', 'i-discarded', new Date(2026, 0, 5), true),
    );

    const { inspectionAssignments } = await sut.handle({
      organizationId: 'org-1',
    });

    expect(
      inspectionAssignments.map(({ assignment }) => assignment.id),
    ).toEqual(['a2', 'a3', 'a1']);
    const [a2, a3, a1] = inspectionAssignments;

    expect(a2.workOrder).toEqual({
      id: 'wo-2',
      vesselId: 'v2',
      status: 'IN_PROGRESS',
    });
    expect(a2.service).toEqual({
      id: 's1',
      name: 'Pintura',
      status: 'IN_PROGRESS',
    });
    expect(a2.assignment.inspections.map((item) => item.id)).toEqual([
      'i-new',
      'i-old',
    ]);
    expect(a2.assignment.removable).toBe(false);

    // A discarded Inspection is not shown, and it still keeps the assignment.
    expect(a3.workOrder).toEqual({
      id: 'wo-1',
      vesselId: 'v1',
      status: 'PENDING',
    });
    expect(a3.service).toBeNull();
    expect(a3.assignment.inspections).toEqual([]);
    expect(a3.assignment.removable).toBe(false);

    expect(a1.service).toBeNull();
    expect(a1.assignment.inspections).toEqual([]);
    expect(a1.assignment.removable).toBe(true);

    const other = await sut.handle({ organizationId: 'org-2' });
    expect(
      other.inspectionAssignments.map(({ assignment }) => assignment.id),
    ).toEqual(['a-other']);
    expect(
      (await sut.handle({ organizationId: 'org-3' })).inspectionAssignments,
    ).toEqual([]);
  });
});
