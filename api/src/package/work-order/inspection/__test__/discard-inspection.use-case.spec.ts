import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionAssignment } from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { Inspection } from '../inspection.entity.js';
import { DiscardInspectionUseCase } from '../discard-inspection.use-case.js';

let assignments: InMemoryInspectionAssignmentsRepository;
let inspections: InMemoryInspectionsRepository;
let sut: DiscardInspectionUseCase;

const inspectionOf = (
  assignmentId: string,
  id: string,
  organizationId = 'org-1',
) =>
  Inspection.create(
    {
      organizationId,
      assignmentId,
      result: 'APPROVED',
      inspectorId: 'user-1',
      inspectorName: 'Inês',
      answers: [],
    },
    id,
  );

const discard = (id: string, assignmentId = 'a1', workOrderId = 'wo-1') =>
  sut.handle({
    organizationId: 'org-1',
    workOrderId,
    assignmentId,
    id,
    discardedBy: 'user-7',
  });

describe('DiscardInspectionUseCase', () => {
  beforeEach(() => {
    assignments = new InMemoryInspectionAssignmentsRepository();
    inspections = new InMemoryInspectionsRepository(assignments);
    sut = new DiscardInspectionUseCase(assignments, inspections);

    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a1'),
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a2'),
    );
    inspections.items.push(inspectionOf('a1', 'i1'), inspectionOf('a1', 'i2'));
  });

  it('inspection C15 marks who and when, hides it and keeps the others', async () => {
    const before = Date.now();

    await discard('i1');

    const discarded = inspections.items.find((item) => item.id === 'i1')!;
    expect(discarded.discardedBy).toBe('user-7');
    expect(discarded.discardedAt!.getTime()).toBeGreaterThanOrEqual(before);
    expect(await inspections.findVisibleById('org-1', 'i1')).toBeNull();

    const [assignment] = (
      await assignments.findManyByWorkOrderId('org-1', 'wo-1')
    ).filter((item) => item.id === 'a1');
    expect(assignment.inspections.map((item) => item.id)).toEqual(['i2']);
    expect(assignment.inspectionCount).toBe(2);
  });

  it('inspection C16 throws NotFoundDomainException and changes nothing', async () => {
    inspections.items.push(
      inspectionOf('a2', 'i-other-assignment'),
      inspectionOf('a1', 'i-other-organization', 'org-2'),
    );
    await discard('i1');

    for (const [id, assignmentId, workOrderId] of [
      ['i1', 'a1', 'wo-1'],
      ['unknown', 'a1', 'wo-1'],
      ['i-other-assignment', 'a1', 'wo-1'],
      ['i-other-organization', 'a1', 'wo-1'],
      ['i2', 'a1', 'wo-other'],
    ]) {
      await expect(
        discard(id, assignmentId, workOrderId),
        id,
      ).rejects.toBeInstanceOf(NotFoundDomainException);
    }

    expect(
      inspections.items.filter((item) => item.discarded).map((item) => item.id),
    ).toEqual(['i1']);
    expect(
      inspections.items.find((item) => item.id === 'i1')!.discardedBy,
    ).toBe('user-7');
  });
});
