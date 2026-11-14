import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionAssignment } from '@test/factory.js';
import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { RemoveInspectionAssignmentUseCase } from '../remove-inspection-assignment.use-case.js';

let assignments: InMemoryInspectionAssignmentsRepository;
let sut: RemoveInspectionAssignmentUseCase;

describe('RemoveInspectionAssignmentUseCase', () => {
  beforeEach(() => {
    assignments = new InMemoryInspectionAssignmentsRepository();
    sut = new RemoveInspectionAssignmentUseCase(assignments);
  });

  it('assignment C10 deletes the assignment and its items', async () => {
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a1'),
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a2'),
    );

    await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      id: 'a1',
    });

    expect(assignments.items.map((item) => item.id)).toEqual(['a2']);
    expect(await assignments.findById('org-1', 'a1')).toBeNull();
  });

  it('assignment C11 throws NotFoundDomainException for another WorkOrder or Organization and deletes nothing', async () => {
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a1'),
      makeInspectionAssignment(
        { organizationId: 'org-2', workOrderId: 'wo-1' },
        'a-foreign',
      ),
    );

    for (const request of [
      { workOrderId: 'wo-2', id: 'a1' },
      { workOrderId: 'wo-1', id: 'a-foreign' },
      { workOrderId: 'wo-1', id: 'unknown' },
    ]) {
      await expect(
        sut.handle({ organizationId: 'org-1', ...request }),
        JSON.stringify(request),
      ).rejects.toBeInstanceOf(NotFoundDomainException);
    }

    expect(assignments.items).toHaveLength(2);
  });

  it('inspection C19 refuses an assignment with any Inspection', async () => {
    const inspections = new InMemoryInspectionsRepository(assignments);
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a-visible'),
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a-discarded'),
    );
    const make = (assignmentId: string) =>
      Inspection.create({
        organizationId: 'org-1',
        assignmentId,
        result: 'APPROVED',
        inspectorId: 'user-9',
        inspectorName: 'Inês',
        answers: [],
      });
    const discarded = make('a-discarded');
    discarded.discard('user-9');
    inspections.items.push(make('a-visible'), discarded);

    for (const id of ['a-visible', 'a-discarded']) {
      await expect(
        sut.handle({ organizationId: 'org-1', workOrderId: 'wo-1', id }),
        id,
      ).rejects.toBeInstanceOf(ConflictDomainException);
    }
    expect(assignments.items.map((item) => item.id)).toEqual([
      'a-visible',
      'a-discarded',
    ]);
  });
});
