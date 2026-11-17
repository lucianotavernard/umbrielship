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

import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';

import {
  makeInspectionAssignment,
  makeService,
  makeWorkOrder,
} from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { AssignInspectionTemplateUseCase } from '../assign-inspection-template.use-case.js';
import { FetchInspectionAssignmentsUseCase } from '../fetch-inspection-assignments.use-case.js';
import { FetchOrganizationInspectionAssignmentsUseCase } from '../fetch-organization-inspection-assignments.use-case.js';
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
    {
      sub: subs[role],
      name: `User ${role}`,
      organizationId: ORGANIZATION,
      role,
      internal: false,
    },
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
  fetchAll: {
    handle: vi.fn(async (_input: unknown) => ({ inspectionAssignments: [] })),
  },
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
        {
          provide: FetchOrganizationInspectionAssignmentsUseCase,
          useValue: fakes.fetchAll,
        },
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
          removable: true,
          inspections: [],
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

  it('inspection C14 answers each assignment with removable and its Inspections', async () => {
    const inspected = assignment();
    inspected.inspectionCount = 2;
    inspected.inspections = [
      Inspection.restore(
        {
          organizationId: ORGANIZATION,
          assignmentId: ASSIGNMENT,
          result: 'REPROVED',
          inspectorId: 'user-9',
          inspectorName: 'Inês Prado',
          completedAt: new Date('2026-11-14T10:00:00.000Z'),
          discardedAt: null,
          discardedBy: null,
          answers: [
            {
              id: 'ans-1',
              itemId: inspected.items[0].id,
              notApplicable: true,
              value: null,
              note: null,
            },
          ],
        },
        'i1',
      ),
    ];
    fakes.fetch.handle.mockResolvedValueOnce({
      inspectionAssignments: [inspected],
    });

    const response = await agent()
      .get(path)
      .set('Authorization', `Bearer ${tokens.operator}`);

    expect(response.body.inspectionAssignments[0]).toMatchObject({
      removable: false,
      inspections: [
        {
          id: 'i1',
          result: 'REPROVED',
          inspectorName: 'Inês Prado',
          completedAt: '2026-11-14T10:00:00.000Z',
          answers: [
            {
              itemId: inspected.items[0].id,
              notApplicable: true,
              value: null,
              note: null,
            },
          ],
        },
      ],
    });
  });

  it('inspection C41 answers 409 when an inspected assignment is removed', async () => {
    fakes.remove.handle.mockRejectedValueOnce(
      new ConflictDomainException('Inspection assignment has inspections'),
    );

    const response = await remove('administrator');

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Inspection assignment has inspections');
  });
});

describe('GET /inspection-assignments', () => {
  const OTHER_ORGANIZATION = '99999999-9999-4999-8999-999999999999';
  const OTHER_WORK_ORDER = '66666666-6666-4666-8666-666666666666';
  const VESSEL = '77777777-7777-4777-8777-777777777777';
  const workOrders = new InMemoryWorkOrdersRepository();
  const assignments = new InMemoryInspectionAssignmentsRepository(workOrders);
  const inspections = new InMemoryInspectionsRepository(assignments);
  const fetchAll = new FetchOrganizationInspectionAssignmentsUseCase(
    assignments,
  );
  const fetchAllSpy = vi.spyOn(fetchAll, 'handle');
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
        {
          provide: FetchOrganizationInspectionAssignmentsUseCase,
          useValue: fetchAll,
        },
      ],
      users,
    }));

    tokens = Object.fromEntries(ROLES.map((role) => [role, sign(subs[role])]));
  });

  afterAll(async () => {
    await app.close();
  });

  it('work-order-ui C34 answers every role with the assignments and 401 without a token', async () => {
    workOrders.items.push(
      makeWorkOrder(
        {
          organizationId: ORGANIZATION,
          vesselId: VESSEL,
          status: 'IN_PROGRESS',
        },
        WORK_ORDER,
      ),
      makeWorkOrder(
        { organizationId: OTHER_ORGANIZATION, vesselId: VESSEL },
        OTHER_WORK_ORDER,
      ),
    );
    workOrders.services.items.push(
      makeService(
        {
          organizationId: ORGANIZATION,
          workOrderId: WORK_ORDER,
          name: 'Pintura',
          status: 'COMPLETED',
        },
        SERVICE,
      ),
    );
    const inspected = assignment();
    assignments.items.push(
      inspected,
      makeInspectionAssignment(
        {
          organizationId: ORGANIZATION,
          workOrderId: WORK_ORDER,
          templateName: 'Casco inteiro',
          labels: ['C'],
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
        },
        'whole',
      ),
      makeInspectionAssignment(
        {
          organizationId: OTHER_ORGANIZATION,
          workOrderId: OTHER_WORK_ORDER,
          createdAt: new Date('2026-01-09T00:00:00.000Z'),
        },
        'other',
      ),
    );
    inspections.items.push(
      Inspection.restore(
        {
          organizationId: ORGANIZATION,
          assignmentId: ASSIGNMENT,
          result: 'APPROVED',
          inspectorId: 'user-9',
          inspectorName: 'Inês Prado',
          completedAt: new Date('2026-11-14T10:00:00.000Z'),
          discardedAt: null,
          discardedBy: null,
          answers: [],
        },
        'i1',
      ),
    );

    for (const role of ROLES) {
      const response = await request(app.getHttpServer())
        .get('/inspection-assignments')
        .set('Authorization', `Bearer ${tokens[role]}`);

      expect(response.status, role).toBe(200);
      expect(response.body, role).toEqual({
        inspectionAssignments: [
          {
            id: 'whole',
            templateName: 'Casco inteiro',
            service: null,
            createdAt: '2026-01-02T00:00:00.000Z',
            removable: true,
            inspections: [],
            items: [
              {
                id: expect.any(String),
                label: 'C',
                position: 0,
                type: 'CONFORMITY',
              },
            ],
            workOrder: {
              id: WORK_ORDER,
              vesselId: VESSEL,
              status: 'IN_PROGRESS',
            },
          },
          {
            id: ASSIGNMENT,
            templateName: 'Pintura do casco',
            service: { id: SERVICE, name: 'Pintura', status: 'COMPLETED' },
            createdAt: '2026-01-01T00:00:00.000Z',
            removable: false,
            inspections: [
              {
                id: 'i1',
                result: 'APPROVED',
                inspectorName: 'Inês Prado',
                completedAt: '2026-11-14T10:00:00.000Z',
                answers: [],
              },
            ],
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
            workOrder: {
              id: WORK_ORDER,
              vesselId: VESSEL,
              status: 'IN_PROGRESS',
            },
          },
        ],
      });
    }
    expect(fetchAllSpy).toHaveBeenCalledTimes(3);
    expect(fetchAllSpy).toHaveBeenCalledWith({ organizationId: ORGANIZATION });

    const anonymous = await request(app.getHttpServer()).get(
      '/inspection-assignments',
    );
    expect(anonymous.status).toBe(401);
    expect(fetchAllSpy).toHaveBeenCalledTimes(3);
  });
});
