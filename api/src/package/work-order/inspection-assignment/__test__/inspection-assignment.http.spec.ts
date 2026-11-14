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

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import { makeInspectionAssignment } from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { AssignInspectionTemplateUseCase } from '../assign-inspection-template.use-case.js';
import { FetchInspectionAssignmentsUseCase } from '../fetch-inspection-assignments.use-case.js';
import { InspectionAssignmentController } from '../inspection-assignment.controller.js';
import { RemoveInspectionAssignmentUseCase } from '../remove-inspection-assignment.use-case.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const WORK_ORDER = '22222222-2222-4222-8222-222222222222';
const TEMPLATE = '33333333-3333-4333-8333-333333333333';
const SERVICE = '44444444-4444-4444-8444-444444444444';
const ASSIGNMENT = '55555555-5555-4555-8555-555555555555';
const ROLES: Role[] = ['administrator', 'operator', 'inspector'];

const subs: Record<Role, string> = {
  administrator: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  operator: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  inspector: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
};

const users: Record<string, UserPayload> = Object.fromEntries(
  ROLES.map((role) => [
    subs[role],
    { sub: subs[role], organizationId: ORGANIZATION, role, internal: false },
  ]),
);

const assignment = () =>
  makeInspectionAssignment(
    {
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
      service: { id: SERVICE, name: 'Pintura' },
      templateName: 'Pintura do casco',
      labels: ['A', 'B'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    ASSIGNMENT,
  );

const fakes = {
  assign: {
    handle: vi.fn(async (_input: unknown) => ({
      inspectionAssignment: assignment(),
    })),
  },
  fetch: {
    handle: vi.fn(async (_input: unknown) => ({
      inspectionAssignments: [assignment()],
    })),
  },
  remove: { handle: vi.fn(async (_input: unknown) => undefined) },
};

const calls = () =>
  Object.values(fakes).reduce(
    (total, fake) => total + fake.handle.mock.calls.length,
    0,
  );

const path = `/work-orders/${WORK_ORDER}/inspection-assignments`;

describe('InspectionAssignment routes over HTTP', () => {
  let app: INestApplication;
  let tokens: Record<string, string>;

  beforeAll(async () => {
    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [InspectionAssignmentController],
      providers: [
        { provide: AssignInspectionTemplateUseCase, useValue: fakes.assign },
        { provide: FetchInspectionAssignmentsUseCase, useValue: fakes.fetch },
        { provide: RemoveInspectionAssignmentUseCase, useValue: fakes.remove },
      ],
      users,
    }));

    tokens = Object.fromEntries(ROLES.map((role) => [role, sign(subs[role])]));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    for (const fake of Object.values(fakes)) fake.handle.mockClear();
  });

  const agent = () => request(app.getHttpServer());
  const post = (role: Role, body: object) =>
    agent()
      .post(path)
      .set('Authorization', `Bearer ${tokens[role]}`)
      .send(body);
  const remove = (role: Role) =>
    agent()
      .delete(`${path}/${ASSIGNMENT}`)
      .set('Authorization', `Bearer ${tokens[role]}`);

  it('assignment C6 answers 404 when the use case finds nothing', async () => {
    fakes.assign.handle.mockRejectedValueOnce(
      new NotFoundDomainException('Work order not found'),
    );
    expect((await post('administrator', { templateId: TEMPLATE })).status).toBe(
      404,
    );

    fakes.fetch.handle.mockRejectedValueOnce(
      new NotFoundDomainException('Work order not found'),
    );
    const list = await agent()
      .get(path)
      .set('Authorization', `Bearer ${tokens.operator}`);
    expect(list.status).toBe(404);

    fakes.remove.handle.mockRejectedValueOnce(
      new NotFoundDomainException('Inspection assignment not found'),
    );
    expect((await remove('administrator')).status).toBe(404);
  });

  it('assignment C7 answers 400 for a missing or invalid templateId or serviceId', async () => {
    for (const body of [
      {},
      { templateId: 'not-a-uuid' },
      { templateId: TEMPLATE, serviceId: 'not-a-uuid' },
    ]) {
      const response = await post('administrator', body);
      expect(response.status, JSON.stringify(body)).toBe(400);
    }
    expect(calls()).toBe(0);

    const created = await post('administrator', {
      templateId: TEMPLATE,
      serviceId: SERVICE,
    });
    expect(created.status).toBe(201);
    expect(fakes.assign.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
      templateId: TEMPLATE,
      serviceId: SERVICE,
      assignedBy: subs.administrator,
    });
  });

  it('assignment C8 answers each assignment with templateName, service, createdAt and items', async () => {
    const response = await agent()
      .get(path)
      .set('Authorization', `Bearer ${tokens.inspector}`);

    expect(response.status).toBe(200);
    expect(fakes.fetch.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
    });
    expect(response.body).toEqual({
      inspectionAssignments: [
        {
          id: ASSIGNMENT,
          templateName: 'Pintura do casco',
          service: { id: SERVICE, name: 'Pintura' },
          createdAt: '2026-01-01T00:00:00.000Z',
          items: [
            {
              id: expect.any(String),
              label: 'A',
              position: 0,
              type: 'CONFORMITY',
            },
            {
              id: expect.any(String),
              label: 'B',
              position: 1,
              type: 'CONFORMITY',
            },
          ],
        },
      ],
    });
    expect(response.body.inspectionAssignments[0]).not.toHaveProperty(
      'assignedBy',
    );
  });

  it('assignment C10 answers 204 to a remove', async () => {
    const response = await remove('administrator');

    expect(response.status).toBe(204);
    expect(fakes.remove.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      workOrderId: WORK_ORDER,
      id: ASSIGNMENT,
    });
  });

  it('assignment C12 refuses POST and DELETE to operator and inspector with 403 before validation', async () => {
    for (const role of ['operator', 'inspector'] as const) {
      for (const response of [
        await post(role, { templateId: TEMPLATE }),
        await post(role, { templateId: 'not-a-uuid' }),
        await remove(role),
      ]) {
        expect(response.status, role).toBe(403);
        expect(response.body).toEqual({
          statusCode: 403,
          message: 'Forbidden',
        });
      }
    }
    expect(calls()).toBe(0);

    expect((await post('administrator', { templateId: TEMPLATE })).status).toBe(
      201,
    );
    expect((await remove('administrator')).status).toBe(204);
    expect(calls()).toBe(2);
  });

  it('assignment C29 answers 401 without a token and lets every Role read', async () => {
    const anonymous = [
      () => agent().get(path),
      () => agent().post(path).send({ templateId: TEMPLATE }),
      () => agent().delete(`${path}/${ASSIGNMENT}`),
    ];
    for (const [index, call] of anonymous.entries()) {
      expect((await call()).status, `route ${index}`).toBe(401);
    }

    for (const role of ROLES) {
      const response = await agent()
        .get(path)
        .set('Authorization', `Bearer ${tokens[role]}`);
      expect(response.status, role).toBe(200);
    }
  });
});
