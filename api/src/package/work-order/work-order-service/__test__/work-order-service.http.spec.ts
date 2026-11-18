import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import { makeWorkOrder } from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { CreateWorkOrderServiceUseCase } from '../create-work-order-service.use-case.js';
import { DeleteWorkOrderServiceUseCase } from '../delete-work-order-service.use-case.js';
import { EditWorkOrderServiceUseCase } from '../edit-work-order-service.use-case.js';
import { FetchWorkOrderServicesUseCase } from '../fetch-work-order-services.use-case.js';
import { GetWorkOrderServiceByIdUseCase } from '../get-work-order-service-by-id.use-case.js';
import { WorkOrderServiceController } from '../work-order-service.controller.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER = '99999999-9999-4999-8999-999999999999';
const STAFF = '66666666-6666-4666-8666-666666666666';
const TEAM = '44444444-4444-4444-8444-444444444444';
const STRANGER_STAFF = '67676767-6767-4767-8767-676767676767';
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
      name: role,
      organizationId: ORGANIZATION,
      role,
      internal: false,
    },
  ]),
);

const workOrders = new InMemoryWorkOrdersRepository();
const workforce = inMemoryWorkforce();
let app: INestApplication;
let tokens: Record<Role, string>;

beforeAll(async () => {
  let sign: (sub: string) => string;
  ({ app, sign } = await bootHttp({
    controllers: [WorkOrderServiceController],
    providers: [
      {
        provide: CreateWorkOrderServiceUseCase,
        useValue: new CreateWorkOrderServiceUseCase(
          workOrders,
          workOrders.services,
          workforce.facade,
        ),
      },
      {
        provide: DeleteWorkOrderServiceUseCase,
        useValue: new DeleteWorkOrderServiceUseCase(
          workOrders.services,
          new InMemoryInspectionsRepository(),
          workforce.facade,
        ),
      },
      { provide: EditWorkOrderServiceUseCase, useValue: {} },
      { provide: FetchWorkOrderServicesUseCase, useValue: {} },
      { provide: GetWorkOrderServiceByIdUseCase, useValue: {} },
    ],
    users,
  }));
  tokens = Object.fromEntries(
    ROLES.map((role) => [role, sign(subs[role])]),
  ) as Record<Role, string>;
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  workOrders.items = [
    makeWorkOrder(
      { organizationId: ORGANIZATION, status: 'IN_PROGRESS' },
      'wo1',
    ),
    makeWorkOrder(
      { organizationId: ORGANIZATION, status: 'COMPLETED' },
      'wo-done',
    ),
  ];
  workOrders.services.items = [];
  workforce.staff.items = [
    makeStaff({ organizationId: ORGANIZATION }, STAFF),
    makeStaff({ organizationId: OTHER, email: 'o@x.test' }, STRANGER_STAFF),
  ];
  workforce.teams.items = [makeTeam({ organizationId: ORGANIZATION }, TEAM)];
  workforce.assignments.items = [];
});

const post = (
  workOrderId: string,
  body: object,
  role: Role = 'administrator',
) =>
  request(app.getHttpServer())
    .post(`/work-orders/${workOrderId}/services`)
    .set('Authorization', `Bearer ${tokens[role]}`)
    .send({
      name: 'Pintura',
      description: 'Casco',
      startDate: '2026-11-17T09:00:00.000Z',
      endDate: '2026-11-18T17:00:00.000Z',
      status: 'PENDING',
      ...body,
    });

describe('POST /work-orders/:workOrderId/services', () => {
  it('workforce C21 answers 403 to an operator sending an assignee', async () => {
    expect((await post('wo1', { staffId: STAFF }, 'operator')).status).toBe(
      403,
    );
    expect(workOrders.services.items).toHaveLength(0);

    expect((await post('wo1', {}, 'operator')).status).toBe(201);
    expect(workforce.assignments.items).toHaveLength(0);
  });

  it('workforce C23 answers 201, 400, 404 and 409', async () => {
    const created = await post('wo1', { teamId: TEAM });
    expect(created.status).toBe(201);
    expect(workforce.assignments.items).toEqual([
      expect.objectContaining({
        workOrderId: 'wo1',
        workOrderServiceId: created.body.service.id,
        staffId: null,
        teamId: TEAM,
      }),
    ]);

    expect((await post('wo1', { staffId: STAFF, teamId: TEAM })).status).toBe(
      400,
    );

    const stranger = await post('wo1', { staffId: STRANGER_STAFF });
    expect(stranger.status).toBe(404);
    expect(stranger.body.message).toBe('Staff not found');

    const done = await post('wo-done', { staffId: STAFF });
    expect(done.status).toBe(409);
    expect(done.body.message).toBe('Work order service is not open');

    const completed = await post('wo1', {
      staffId: STAFF,
      status: 'COMPLETED',
    });
    expect(completed.status).toBe(409);

    expect(workOrders.services.items).toHaveLength(1);
    expect(workforce.assignments.items).toHaveLength(1);
  });
});
