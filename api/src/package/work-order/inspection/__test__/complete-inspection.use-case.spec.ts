import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type { QuestionType } from '@/package/work-order/inspection-template/inspection-template.entity.js';

import {
  makeInspectionAssignment,
  makeService,
  makeWorkOrder,
} from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import {
  CompleteInspectionUseCase,
  SubmittedAnswer,
} from '../complete-inspection.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let services: InMemoryWorkOrderServicesRepository;
let assignments: InMemoryInspectionAssignmentsRepository;
let inspections: InMemoryInspectionsRepository;
let sut: CompleteInspectionUseCase;

const TYPES: QuestionType[] = ['TEXT', 'YES_NO', 'CONFORMITY', 'SCORE'];

// One question of each type, in that order.
const mixed = (overrides: Record<string, unknown> = {}) =>
  makeInspectionAssignment(
    {
      workOrderId: 'wo-1',
      questions: TYPES.map((type) => ({ label: `Q ${type}`, type })),
      ...overrides,
    },
    'a1',
  );

const itemOf = (type: QuestionType, assignmentId = 'a1') =>
  assignments.items
    .find((item) => item.id === assignmentId)!
    .items.find((item) => item.type === type)!.id;

const valid = (): SubmittedAnswer[] => [
  { itemId: itemOf('TEXT'), value: 'Casco sem manchas' },
  { itemId: itemOf('YES_NO'), value: true },
  { itemId: itemOf('CONFORMITY'), value: false, note: 'Bolhas na proa' },
  { itemId: itemOf('SCORE'), value: 8 },
];

const complete = (answers: SubmittedAnswer[], assignmentId = 'a1') =>
  sut.handle({
    organizationId: 'org-1',
    workOrderId: 'wo-1',
    assignmentId,
    result: 'REPROVED',
    answers,
    inspector: { id: 'user-9', name: 'Inês Prado' },
  });

const replace = (type: QuestionType, answer: Partial<SubmittedAnswer>) =>
  valid().map((item) =>
    item.itemId === itemOf(type) ? { itemId: item.itemId, ...answer } : item,
  );

describe('CompleteInspectionUseCase', () => {
  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    services = new InMemoryWorkOrderServicesRepository();
    assignments = new InMemoryInspectionAssignmentsRepository();
    inspections = new InMemoryInspectionsRepository(assignments);
    sut = new CompleteInspectionUseCase(
      assignments,
      workOrders,
      services,
      inspections,
    );

    workOrders.items.push(
      makeWorkOrder({ status: 'IN_PROGRESS' }, 'wo-1'),
      makeWorkOrder({ status: 'IN_PROGRESS' }, 'wo-2'),
    );
    assignments.items.push(mixed());
  });

  it('inspection C7 stores the Inspection with the result, the inspector and every answer', async () => {
    const before = Date.now();

    const { inspection } = await complete(valid());

    expect(inspections.items).toEqual([inspection]);
    expect(inspection).toMatchObject({
      organizationId: 'org-1',
      assignmentId: 'a1',
      result: 'REPROVED',
      inspectorId: 'user-9',
      inspectorName: 'Inês Prado',
      discardedAt: null,
    });
    expect(inspection.completedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(
      inspection.answers.map(({ itemId, notApplicable, value, note }) => ({
        itemId,
        notApplicable,
        value,
        note,
      })),
    ).toEqual([
      {
        itemId: itemOf('TEXT'),
        notApplicable: false,
        value: 'Casco sem manchas',
        note: null,
      },
      {
        itemId: itemOf('YES_NO'),
        notApplicable: false,
        value: true,
        note: null,
      },
      {
        itemId: itemOf('CONFORMITY'),
        notApplicable: false,
        value: false,
        note: 'Bolhas na proa',
      },
      { itemId: itemOf('SCORE'), notApplicable: false, value: 8, note: null },
    ]);
  });

  it('inspection C8 accepts a value of each type or not applicable and refuses the rest', async () => {
    for (const answer of [
      { value: 0 },
      { value: 10 },
      { notApplicable: true },
    ]) {
      await complete(replace('SCORE', answer));
    }
    await complete(replace('TEXT', { value: `  ${'t'.repeat(1000)}  ` }));
    await complete(replace('YES_NO', { value: false }));
    await complete(replace('CONFORMITY', { notApplicable: true }));
    expect(inspections.items).toHaveLength(6);
    expect(inspections.items[3].answers[0].value).toBe('t'.repeat(1000));
    expect(inspections.items[2].answers[3]).toMatchObject({
      notApplicable: true,
      value: null,
    });

    const refused: [QuestionType, Partial<SubmittedAnswer>][] = [
      ['SCORE', { value: 11 }],
      ['SCORE', { value: -1 }],
      ['SCORE', { value: 7.5 }],
      ['SCORE', { value: '8' }],
      ['TEXT', { value: '   ' }],
      ['TEXT', { value: 't'.repeat(1001) }],
      ['TEXT', { value: true }],
      ['YES_NO', { value: 'sim' }],
      ['CONFORMITY', { value: 1 }],
      ['YES_NO', {}],
      ['SCORE', { notApplicable: true, value: 5 }],
    ];
    for (const [type, answer] of refused) {
      await expect(
        complete(replace(type, answer)),
        `${type} ${JSON.stringify(answer)}`,
      ).rejects.toBeInstanceOf(ConflictDomainException);
    }
    expect(inspections.items).toHaveLength(6);
  });

  it('inspection C9 accepts a trimmed note except on free text', async () => {
    const { inspection } = await complete(
      valid().map((answer) =>
        answer.itemId === itemOf('TEXT')
          ? answer
          : { ...answer, note: `  nota ${answer.itemId.slice(0, 4)}  ` },
      ),
    );
    expect(
      inspection.answers.filter((answer) => answer.note !== null),
    ).toHaveLength(3);
    expect(inspection.answers[1].note).toBe(
      `nota ${itemOf('YES_NO').slice(0, 4)}`,
    );

    await expect(
      complete(replace('TEXT', { value: 'Texto', note: 'nota' })),
    ).rejects.toBeInstanceOf(ConflictDomainException);
    expect(inspections.items).toHaveLength(1);
  });

  it('inspection C10 refuses missing, foreign and repeated answers and stores nothing', async () => {
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-1' }, 'a2'),
    );
    const foreign = assignments.items.find((item) => item.id === 'a2')!.items[0]
      .id;

    const cases: SubmittedAnswer[][] = [
      valid().slice(1),
      [...valid().slice(1), { itemId: foreign, value: true }],
      [...valid(), { itemId: itemOf('SCORE'), value: 9 }],
      [],
    ];
    for (const answers of cases) {
      await expect(complete(answers)).rejects.toBeInstanceOf(
        ConflictDomainException,
      );
    }
    expect(inspections.items).toEqual([]);
  });

  it('inspection C11 requires the WorkOrder and the targeted service in progress', async () => {
    workOrders.items[0].status = 'PENDING';
    await expect(complete(valid())).rejects.toBeInstanceOf(
      ConflictDomainException,
    );

    workOrders.items[0].status = 'IN_PROGRESS';
    services.items.push(
      makeService({ workOrderId: 'wo-1', status: 'COMPLETED' }, 'svc-1'),
    );
    assignments.items[0].service = { id: 'svc-1', name: 'Pintura' };
    await expect(complete(valid())).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
    expect(inspections.items).toEqual([]);

    services.items[0].status = 'IN_PROGRESS';
    await complete(valid());

    assignments.items[0].service = null;
    await complete(valid());
    expect(inspections.items).toHaveLength(2);

    for (const status of ['PENDING', 'COMPLETED', 'CANCELLED'] as const) {
      workOrders.items[0].status = status;
      await expect(complete(valid()), status).rejects.toBeInstanceOf(
        ConflictDomainException,
      );
    }
    expect(inspections.items).toHaveLength(2);
  });

  it('inspection C13 adds an Inspection each time and keeps the earlier ones', async () => {
    const [first, second] = await Promise.all([
      complete(valid()),
      complete(valid()),
    ]);

    expect(inspections.items.map((item) => item.id)).toEqual([
      first.inspection.id,
      second.inspection.id,
    ]);
    const [read] = await assignments.findManyByWorkOrderId('org-1', 'wo-1');
    expect(read.inspections).toHaveLength(2);
  });

  it('inspection C18 throws NotFoundDomainException for a foreign assignment and stores nothing', async () => {
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-2' }, 'a-other-work-order'),
      makeInspectionAssignment(
        { organizationId: 'org-2', workOrderId: 'wo-1' },
        'a-other-organization',
      ),
    );

    for (const assignmentId of [
      'unknown',
      'a-other-work-order',
      'a-other-organization',
    ]) {
      await expect(
        complete(valid(), assignmentId),
        assignmentId,
      ).rejects.toBeInstanceOf(NotFoundDomainException);
    }
    expect(inspections.items).toEqual([]);
  });
});
