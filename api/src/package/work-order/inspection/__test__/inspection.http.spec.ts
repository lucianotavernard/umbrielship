import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import { bootHttp } from '@test/http.js';
import { CompleteInspectionUseCase } from '../complete-inspection.use-case.js';
import { DiscardInspectionUseCase } from '../discard-inspection.use-case.js';
import { InspectionController } from '../inspection.controller.js';
import { Inspection } from '../inspection.entity.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const WORK_ORDER = '22222222-2222-4222-8222-222222222222';
const ASSIGNMENT = '33333333-3333-4333-8333-333333333333';
const ITEM = '44444444-4444-4444-8444-444444444444';
const INSPECTION = '55555555-5555-4555-8555-555555555555';
const ROLES: Role[] = ['administrator', 'operator', 'inspector'];

const subs: Record<Role, string> = {
  administrator: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  operator: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  inspector: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
};

const users: Record<string, UserPayload> = Object.fromEntries(
  ROLES.map((role) => [
    subs[role],
    {
      sub: subs[role],
      name: role === 'inspector' ? 'Inês Prado' : `User ${role}`,
      organizationId: ORGANIZATION,
      role,
      internal: false,
    },
  ]),
);

const inspection = () =>
  Inspection.restore(
    {
      organizationId: ORGANIZATION,
      assignmentId: ASSIGNMENT,
      result: 'APPROVED',
      inspectorId: subs.inspector,
      inspectorName: 'Inês Prado',
      completedAt: new Date('2026-11-14T10:00:00.000Z'),
      discardedAt: null,
      discardedBy: null,
      answers: [
        {
          id: 'ans-1',
          itemId: ITEM,
          notApplicable: false,
          value: 8,
          note: 'ok',
        },
      ],
    },
    INSPECTION,
  );

const fakes = {
  complete: {
    handle: vi.fn(async (_input: unknown) => ({ inspection: inspection() })),
  },
  discard: { handle: vi.fn(async (_input: unknown) => undefined) },
};

const calls = () =>
  fakes.complete.handle.mock.calls.length +
  fakes.discard.handle.mock.calls.length;

const path = `/work-orders/${WORK_ORDER}/inspection-assignments/${ASSIGNMENT}/inspections`;
const body = { result: 'APPROVED', answers: [{ itemId: ITEM, value: 8 }] };

describe('Inspection routes over HTTP', () => {
  let app: INestApplication;
  let tokens: Record<string, string>;

  beforeAll(async () => {
    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [InspectionController],
      providers: [
        { provide: CompleteInspectionUseCase, useValue: fakes.complete },
        { provide: DiscardInspectionUseCase, useValue: fakes.discard },
      ],
      users,
    }));

    tokens = Object.fromEntries(ROLES.map((role) => [role, sign(subs[role])]));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    fakes.complete.handle.mockClear();
    fakes.discard.handle.mockClear();
  });

  const agent = () => request(app.getHttpServer());
  const complete = (role: Role, payload: object) =>
    agent()
      .post(path)
      .set('Authorization', `Bearer ${tokens[role]}`)
      .send(payload);
  const discard = (role: Role) =>
    agent()
      .post(`${path}/${INSPECTION}/discard`)
      .set('Authorization', `Bearer ${tokens[role]}`);

  it("inspection C7 passes the inspector's id and name and answers 201 with the Inspection", async () => {
    const response = await complete('inspector', {
      result: 'APPROVED',
      answers: [{ itemId: ITEM, value: 8, note: '  ok  ' }],
    });

    expect(response.status).toBe(201);
    expect(fakes.complete.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
      assignmentId: ASSIGNMENT,
      result: 'APPROVED',
      answers: [{ itemId: ITEM, value: 8, note: 'ok' }],
      inspector: { id: subs.inspector, name: 'Inês Prado' },
    });
    expect(response.body).toEqual({
      inspection: {
        id: INSPECTION,
        result: 'APPROVED',
        inspectorName: 'Inês Prado',
        completedAt: '2026-11-14T10:00:00.000Z',
        answers: [{ itemId: ITEM, notApplicable: false, value: 8, note: 'ok' }],
      },
    });
  });

  it('inspection C12 answers 400 for a missing result or a note over 500 characters', async () => {
    for (const payload of [
      { answers: body.answers },
      { ...body, result: 'APPROVED_WITH_RESERVATIONS' },
      { ...body, answers: [{ itemId: ITEM, value: 8, note: 'n'.repeat(501) }] },
      { ...body, answers: [{ itemId: 'not-a-uuid', value: 8 }] },
    ]) {
      const response = await complete('inspector', payload);
      expect(response.status, JSON.stringify(payload).slice(0, 60)).toBe(400);
    }
    expect(calls()).toBe(0);

    const atLimit = await complete('inspector', {
      ...body,
      answers: [{ itemId: ITEM, value: 8, note: 'n'.repeat(500) }],
    });
    expect(atLimit.status).toBe(201);
  });

  it("inspection C15 answers 204 to a discard with the inspector's id", async () => {
    const response = await discard('inspector');

    expect(response.status).toBe(204);
    expect(fakes.discard.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
      assignmentId: ASSIGNMENT,
      id: INSPECTION,
      discardedBy: subs.inspector,
    });
  });

  it('inspection C17 refuses complete and discard to administrator and operator with 403 before validation', async () => {
    for (const role of ['administrator', 'operator'] as const) {
      for (const response of [
        await complete(role, body),
        await complete(role, { result: 'nope' }),
        await discard(role),
      ]) {
        expect(response.status, role).toBe(403);
        expect(response.body).toEqual({
          statusCode: 403,
          message: 'Forbidden',
        });
      }
    }
    expect(calls()).toBe(0);
  });

  it('inspection C18 answers 404 when the use case finds nothing', async () => {
    fakes.complete.handle.mockRejectedValueOnce(
      new NotFoundDomainException('Inspection assignment not found'),
    );
    expect((await complete('inspector', body)).status).toBe(404);

    fakes.discard.handle.mockRejectedValueOnce(
      new NotFoundDomainException('Inspection not found'),
    );
    expect((await discard('inspector')).status).toBe(404);
  });

  it('inspection C40 answers 401 without a token', async () => {
    expect((await agent().post(path).send(body)).status).toBe(401);
    expect((await agent().post(`${path}/${INSPECTION}/discard`)).status).toBe(
      401,
    );
    expect(calls()).toBe(0);
  });

  it('inspection C41 answers 409 with the message when the answers or the work are refused', async () => {
    fakes.complete.handle.mockRejectedValueOnce(
      new ConflictDomainException('Work order is not in progress'),
    );

    const response = await complete('inspector', body);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Work order is not in progress');
  });
});
