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

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import {
  makeCustomer,
  makeService,
  makeVessel,
  makeWorkOrder,
} from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { CreateWorkOrderUseCase } from '../create-work-order.use-case.js';
import { DeleteWorkOrderUseCase } from '../delete-work-order.use-case.js';
import { EditWorkOrderUseCase } from '../edit-work-order.use-case.js';
import { FetchWorkOrdersUseCase } from '../fetch-work-orders.use-case.js';
import { GetWorkOrderByIdUseCase } from '../get-work-order-by-id.use-case.js';
import { WorkOrderController } from '../work-order.controller.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER_ORGANIZATION = '99999999-9999-4999-8999-999999999999';
const VESSEL = '22222222-2222-4222-8222-222222222222';
const OTHER_VESSEL = '33333333-3333-4333-8333-333333333333';
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

const day = (date: string) => new Date(`${date}T00:00:00.000Z`);

// The use cases run on in-memory repositories, so the routes answer what is stored.
const customers = new InMemoryCustomersRepository();
const vessels = new InMemoryVesselsRepository(customers);
const workOrders = new InMemoryWorkOrdersRepository();
const facade = new CustomerFacade(vessels);
const useCases = {
  create: new CreateWorkOrderUseCase(workOrders, facade),
  delete: new DeleteWorkOrderUseCase(
    workOrders,
    new InMemoryInspectionsRepository(),
  ),
  edit: new EditWorkOrderUseCase(workOrders),
  fetch: new FetchWorkOrdersUseCase(workOrders),
  get: new GetWorkOrderByIdUseCase(workOrders, facade),
};
const fetchSpy = vi.spyOn(useCases.fetch, 'handle');
const createSpy = vi.spyOn(useCases.create, 'handle');

const workOrderBody = (services?: object[]) => ({
  vesselId: VESSEL,
  startDate: '2026-11-17T09:12:00.000Z',
  endDate: '2026-11-20T10:00:00.000Z',
  status: 'PENDING',
  ...(services ? { services } : {}),
});

const servicesOf = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Serviço ${index + 1}`,
    description: 'Descrição',
  }));

let app: INestApplication;
let tokens: Record<Role, string>;

beforeAll(async () => {
  let sign: (sub: string) => string;
  ({ app, sign } = await bootHttp({
    controllers: [WorkOrderController],
    providers: [
      { provide: CreateWorkOrderUseCase, useValue: useCases.create },
      { provide: DeleteWorkOrderUseCase, useValue: useCases.delete },
      { provide: EditWorkOrderUseCase, useValue: useCases.edit },
      { provide: FetchWorkOrdersUseCase, useValue: useCases.fetch },
      { provide: GetWorkOrderByIdUseCase, useValue: useCases.get },
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
  fetchSpy.mockClear();
  createSpy.mockClear();
  customers.items = [
    makeCustomer({ organizationId: ORGANIZATION }, 'customer-1'),
    makeCustomer({ organizationId: OTHER_ORGANIZATION }, 'customer-2'),
  ];
  vessels.items = [
    makeVessel(
      { organizationId: ORGANIZATION, customerId: 'customer-1' },
      VESSEL,
    ),
    makeVessel(
      { organizationId: OTHER_ORGANIZATION, customerId: 'customer-2' },
      OTHER_VESSEL,
    ),
  ];
  workOrders.items = [];
  workOrders.services.items = [];
});

const agent = () => request(app.getHttpServer());
const list = (query = '', role: Role = 'operator') =>
  agent()
    .get(`/work-orders${query}`)
    .set('Authorization', `Bearer ${tokens[role]}`);
const create = (body: object, role: Role = 'operator') =>
  agent()
    .post('/work-orders')
    .set('Authorization', `Bearer ${tokens[role]}`)
    .send(body);

describe('GET /work-orders', () => {
  it('work-order-ui C2 answers every work order without take and 10 with take', async () => {
    for (let index = 1; index <= 14; index++) {
      workOrders.items.push(
        makeWorkOrder(
          {
            organizationId: ORGANIZATION,
            vesselId: index <= 3 ? VESSEL : OTHER_VESSEL,
            startDate: day('2026-06-01'),
            endDate: day('2026-06-20'),
          },
          `wo-${index}`,
        ),
      );
    }
    workOrders.items.push(
      makeWorkOrder(
        { organizationId: OTHER_ORGANIZATION, vesselId: VESSEL },
        'wo-other',
      ),
    );
    workOrders.services.items.push(
      makeService(
        {
          organizationId: ORGANIZATION,
          workOrderId: 'wo-1',
          name: 'Pintura',
          startDate: day('2026-06-10'),
          endDate: day('2026-06-12'),
        },
        's-pintura',
      ),
      makeService(
        {
          organizationId: ORGANIZATION,
          workOrderId: 'wo-1',
          name: 'Motor',
          startDate: day('2026-06-02'),
          endDate: day('2026-06-05'),
          status: 'IN_PROGRESS',
        },
        's-motor',
      ),
    );

    for (const role of ROLES) {
      const all = await list('', role);
      expect(all.status, role).toBe(200);
      expect(all.body.total, role).toBe(14);
      expect(all.body.workOrders, role).toHaveLength(14);
    }
    expect(fetchSpy).toHaveBeenLastCalledWith({
      organizationId: ORGANIZATION,
      vesselId: undefined,
      take: undefined,
      skip: undefined,
    });

    const all = await list();
    expect(all.body.workOrders.map((item: { id: string }) => item.id)).toEqual(
      Array.from({ length: 14 }, (_, index) => `wo-${index + 1}`),
    );
    expect(all.body.workOrders[0]).toEqual({
      id: 'wo-1',
      vesselId: VESSEL,
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-06-20T00:00:00.000Z',
      status: 'PENDING',
      services: [
        {
          id: 's-motor',
          name: 'Motor',
          startDate: '2026-06-02T00:00:00.000Z',
          endDate: '2026-06-05T00:00:00.000Z',
          status: 'IN_PROGRESS',
        },
        {
          id: 's-pintura',
          name: 'Pintura',
          startDate: '2026-06-10T00:00:00.000Z',
          endDate: '2026-06-12T00:00:00.000Z',
          status: 'PENDING',
        },
      ],
    });
    expect(all.body.workOrders[1].services).toEqual([]);

    const paged = await list('?take=10&skip=0');
    expect(paged.status).toBe(200);
    expect(paged.body.workOrders).toHaveLength(10);
    expect(paged.body.total).toBe(14);
    expect(paged.body.workOrders[0].services).toHaveLength(2);
    expect(fetchSpy).toHaveBeenLastCalledWith({
      organizationId: ORGANIZATION,
      vesselId: undefined,
      take: 10,
      skip: 0,
    });

    // Either one pages: `take` 10 and `skip` 0 by default.
    expect((await list('?take=5')).body.workOrders).toHaveLength(5);
    expect((await list('?skip=10')).body.workOrders).toHaveLength(4);
    expect(fetchSpy).toHaveBeenLastCalledWith({
      organizationId: ORGANIZATION,
      vesselId: undefined,
      take: 10,
      skip: 10,
    });

    const byVessel = await list(`?vesselId=${VESSEL}`);
    expect(
      byVessel.body.workOrders.map((item: { id: string }) => item.id),
    ).toEqual(['wo-1', 'wo-2', 'wo-3']);
    expect(byVessel.body.total).toBe(3);
  });

  it('work-order-ui C2 answers 400 on a bad take and 401 without a token', async () => {
    workOrders.items.push(
      makeWorkOrder({ organizationId: ORGANIZATION, vesselId: VESSEL }, 'wo-1'),
    );

    for (const query of [
      '?take=0',
      '?take=101',
      '?take=abc',
      '?take=1.5',
      '?take=',
      '?skip=-1',
      '?skip=abc',
      '?vesselId=not-a-uuid',
    ]) {
      expect((await list(query)).status, query).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();

    expect((await list('?take=100')).status).toBe(200);
    expect((await list('?take=1')).body.workOrders).toHaveLength(1);

    const anonymous = await agent().get('/work-orders');
    expect(anonymous.status).toBe(401);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

describe('POST /work-orders', () => {
  it('work-order-ui C21 answers 201 with services and 400 for 51 services or an empty name', async () => {
    const created = await create(
      workOrderBody([
        { name: 'Pintura do casco', description: 'Lixar e pintar' },
        { name: 'Motor', description: 'Revisão geral' },
      ]),
    );

    expect(created.status).toBe(201);
    // The response is the WorkOrder alone, as before services were accepted.
    expect(created.body).toEqual({
      workOrder: {
        id: expect.any(String),
        organizationId: ORGANIZATION,
        vesselId: VESSEL,
        startDate: '2026-11-17T09:12:00.000Z',
        endDate: '2026-11-20T10:00:00.000Z',
        status: 'PENDING',
      },
    });
    const id = created.body.workOrder.id;
    expect(workOrders.items.map((item) => item.id)).toEqual([id]);
    expect(
      workOrders.services.items.map(
        ({ workOrderId, name, startDate, endDate, status }) => ({
          workOrderId,
          name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status,
        }),
      ),
    ).toEqual([
      {
        workOrderId: id,
        name: 'Pintura do casco',
        startDate: '2026-11-17T09:12:00.000Z',
        endDate: '2026-11-20T10:00:00.000Z',
        status: 'PENDING',
      },
      {
        workOrderId: id,
        name: 'Motor',
        startDate: '2026-11-17T09:12:00.000Z',
        endDate: '2026-11-20T10:00:00.000Z',
        status: 'PENDING',
      },
    ]);

    expect((await create(workOrderBody())).status).toBe(201);
    expect((await create(workOrderBody(servicesOf(50)))).status).toBe(201);
    expect(workOrders.items).toHaveLength(3);
    expect(workOrders.services.items).toHaveLength(52);
    expect(createSpy).toHaveBeenCalledTimes(3);

    for (const services of [
      servicesOf(51),
      [
        { name: 'Pintura', description: 'Casco' },
        { name: '', description: 'Motor' },
      ],
      [{ name: 'Pintura' }],
    ]) {
      const response = await create(workOrderBody(services));
      expect(response.status, JSON.stringify(services).slice(0, 60)).toBe(400);
    }
    expect(createSpy).toHaveBeenCalledTimes(3);
    expect(workOrders.items).toHaveLength(3);
    expect(workOrders.services.items).toHaveLength(52);
  });

  it('work-order-ui C21 answers 403 to an inspector and 401 without a token', async () => {
    const body = workOrderBody([{ name: 'Pintura', description: 'Casco' }]);

    const inspector = await create(body, 'inspector');
    expect(inspector.status).toBe(403);
    expect(inspector.body).toEqual({ statusCode: 403, message: 'Forbidden' });

    const anonymous = await agent().post('/work-orders').send(body);
    expect(anonymous.status).toBe(401);

    expect(createSpy).not.toHaveBeenCalled();
    expect(workOrders.items).toEqual([]);
    expect(workOrders.services.items).toEqual([]);

    expect((await create(body, 'administrator')).status).toBe(201);
  });

  it('work-order-ui C21 answers 404 for a Vessel of another Organization and stores nothing', async () => {
    const response = await create({
      ...workOrderBody([{ name: 'Pintura', description: 'Casco' }]),
      vesselId: OTHER_VESSEL,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Vessel not found');
    expect(workOrders.items).toEqual([]);
    expect(workOrders.services.items).toEqual([]);
  });
});
