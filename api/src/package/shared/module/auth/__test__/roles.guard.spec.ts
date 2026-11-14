import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import type { INestApplication, Type } from '@nestjs/common';
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

import { CustomerController } from '@/package/customer/customer/customer.controller.js';
import { VesselController } from '@/package/customer/vessel/vessel.controller.js';
import { AuthenticationController } from '@/package/identity/auth/authentication.controller.js';
import { InvitationController } from '@/package/identity/invitation/invitation.controller.js';
import { OrganizationController } from '@/package/identity/organization/organization.controller.js';
import { UserController } from '@/package/identity/user/user.controller.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';
import { WorkOrderServiceImageController } from '@/package/work-order/work-order-service-image/work-order-service-image.controller.js';
import { WorkOrderServiceController } from '@/package/work-order/work-order-service/work-order-service.controller.js';
import { WorkOrderController } from '@/package/work-order/work-order/work-order.controller.js';

import { bootHttp } from '@test/http.js';

type Controller = abstract new (...args: never[]) => object;

const controllers: Controller[] = [
  CustomerController,
  VesselController,
  WorkOrderController,
  WorkOrderServiceController,
  WorkOrderServiceImageController,
  AuthenticationController,
  OrganizationController,
  UserController,
  InvitationController,
];

// Every use case a controller receives, read from the constructor's metadata.
const useCases = [
  ...new Set(
    controllers.flatMap(
      (controller) =>
        (Reflect.getMetadata('design:paramtypes', controller) ?? []) as Type[],
    ),
  ),
];

const fakes = new Map(
  useCases.map((useCase) => [
    useCase,
    { handle: vi.fn(async (_input?: unknown) => ({})) },
  ]),
);

const calls = () =>
  [...fakes.values()].reduce(
    (total, fake) => total + fake.handle.mock.calls.length,
    0,
  );

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER_ORGANIZATION = '22222222-2222-4222-8222-222222222222';
const ID = '33333333-3333-4333-8333-333333333333';

const users: Record<string, UserPayload> = {
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa': {
    sub: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    organizationId: ORGANIZATION,
    role: 'administrator',
    internal: false,
  },
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb': {
    sub: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    organizationId: ORGANIZATION,
    role: 'operator',
    internal: false,
  },
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc': {
    sub: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    organizationId: ORGANIZATION,
    role: 'inspector',
    internal: false,
  },
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd': {
    sub: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    organizationId: ORGANIZATION,
    role: 'administrator',
    internal: true,
  },
};

const subOf = (role: Role, internal = false) =>
  Object.values(users).find(
    (user) => user.role === role && user.internal === internal,
  )!.sub;

const customerBody = {
  name: 'Atlantic',
  email: 'atlantic@example.com',
  phone: null,
  address: { address: 'Rua 1', state: 'SP', city: 'Santos' },
};
const vesselBody = {
  customerId: ID,
  imoNumber: 'IMO1234567',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
};
const workOrderBody = {
  vesselId: ID,
  startDate: '2026-01-01',
  endDate: '2026-01-02',
  status: 'PENDING',
};
const serviceBody = {
  name: 'Pintura',
  description: 'Casco',
  startDate: '2026-01-01',
  endDate: '2026-01-02',
  status: 'PENDING',
};

type Route = {
  method: 'post' | 'put' | 'delete';
  path: string;
  body?: object;
  file?: boolean;
};

const writeRoutes: Route[] = [
  { method: 'post', path: '/customers', body: customerBody },
  { method: 'put', path: `/customers/${ID}`, body: customerBody },
  { method: 'delete', path: `/customers/${ID}` },
  { method: 'post', path: '/vessels', body: vesselBody },
  {
    method: 'put',
    path: `/customers/${ID}/vessels/${ID}`,
    body: { ...vesselBody, imoNumber: undefined },
  },
  { method: 'delete', path: `/vessels/${ID}` },
  { method: 'post', path: '/work-orders', body: workOrderBody },
  {
    method: 'put',
    path: `/work-orders/${ID}`,
    body: { ...workOrderBody, vesselId: undefined },
  },
  { method: 'delete', path: `/work-orders/${ID}` },
  { method: 'post', path: `/work-orders/${ID}/services`, body: serviceBody },
  {
    method: 'put',
    path: `/work-orders/${ID}/services/${ID}`,
    body: serviceBody,
  },
  { method: 'delete', path: `/work-orders/${ID}/services/${ID}` },
  {
    method: 'post',
    path: `/work-orders/${ID}/services/${ID}/images`,
    file: true,
  },
  { method: 'delete', path: `/work-orders/${ID}/services/${ID}/images/${ID}` },
];

const readRoutes = [
  '/customers',
  `/customers/${ID}`,
  '/vessels',
  `/vessels/${ID}`,
  '/work-orders',
  `/work-orders/${ID}`,
  `/work-orders/${ID}/services`,
  `/work-orders/${ID}/services/${ID}`,
  `/work-orders/${ID}/services/${ID}/images`,
];

const uploads = join(process.cwd(), 'uploads', 'work-order-service-images');
const uploaded = () => {
  try {
    return readdirSync(uploads);
  } catch {
    return [];
  }
};

describe('Roles guard over HTTP', () => {
  let app: INestApplication;
  let tokens: Record<string, string>;

  beforeAll(async () => {
    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: controllers as Type[],
      providers: [...fakes].map(([useCase, fake]) => ({
        provide: useCase,
        useValue: fake,
      })),
      users,
    }));

    tokens = Object.fromEntries(
      Object.keys(users).map((sub) => [sub, sign(sub)]),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    for (const fake of fakes.values()) fake.handle.mockClear();
  });

  const send = (route: Route, sub: string, body = route.body) => {
    const call = request(app.getHttpServer())
      [route.method](route.path)
      .set('Authorization', `Bearer ${tokens[sub]}`);

    if (route.file) {
      return call.attach('file', Buffer.from('image'), 'photo.png');
    }

    return body ? call.send(body) : call;
  };

  it('inspector C7 refuses each of the 14 write routes to an inspector with 403 and calls no use case', async () => {
    expect(writeRoutes).toHaveLength(14);

    for (const route of writeRoutes) {
      const response = await send(route, subOf('inspector'));

      expect(response.status, `${route.method} ${route.path}`).toBe(403);
    }

    expect(calls()).toBe(0);
  });

  it('inspector C8 answers 403 before validation and before any read', async () => {
    const invalid = await send(writeRoutes[0], subOf('inspector'), {
      email: 'not an email',
    });
    expect(invalid.status).toBe(403);

    const operatorInvalid = await send(writeRoutes[0], subOf('operator'), {
      email: 'not an email',
    });
    expect(operatorInvalid.status).toBe(400);

    const otherOrganization = await send(
      { method: 'delete', path: `/customers/${OTHER_ORGANIZATION}` },
      subOf('inspector'),
    );
    expect(otherOrganization.status).toBe(403);

    expect(calls()).toBe(0);
  });

  it('inspector C9 writes no file when an inspector uploads an image', async () => {
    const before = uploaded();

    const response = await send(writeRoutes[12], subOf('inspector'));

    expect(response.status).toBe(403);
    expect(uploaded()).toEqual(before);
  });

  it('inspector C10 lets administrator and operator through each of the 14 write routes', async () => {
    const before = uploaded();

    try {
      for (const role of ['administrator', 'operator'] as const) {
        for (const route of writeRoutes) {
          const handled = calls();
          const response = await send(route, subOf(role));

          expect(
            response.status,
            `${role} ${route.method} ${route.path}`,
          ).not.toBe(403);
          expect(calls(), `${role} ${route.method} ${route.path}`).toBe(
            handled + 1,
          );
        }
      }
    } finally {
      for (const file of uploaded()) {
        if (!before.includes(file)) rmSync(join(uploads, file));
      }
    }
  });

  it('inspector C11 lets an inspector through each of the 9 read routes', async () => {
    expect(readRoutes).toHaveLength(9);

    for (const path of readRoutes) {
      const handled = calls();
      const response = await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${tokens[subOf('inspector')]}`);

      expect(response.status, path).not.toBe(403);
      expect(calls(), path).toBe(handled + 1);
    }
  });

  it('inspector C12 lets an operator create a Customer', async () => {
    const response = await send(writeRoutes[0], subOf('operator'));

    expect(response.status).toBe(201);
    expect(calls()).toBe(1);
  });

  it('inspector C14 answers 403 with statusCode 403 and message Forbidden', async () => {
    const response = await send(writeRoutes[0], subOf('inspector'));

    expect(response.body).toEqual({ statusCode: 403, message: 'Forbidden' });
  });

  it('inspector C1 POST /users accepts role inspector and refuses auditor', async () => {
    const body = {
      name: 'Ines',
      email: 'ines@example.com',
      password: 'password123',
      organizationId: ORGANIZATION,
    };

    const created = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${tokens[subOf('administrator', true)]}`)
      .send({ ...body, role: 'inspector' });

    expect(created.status).toBe(201);
    const [createUser] = [...fakes.values()].filter(
      (fake) => fake.handle.mock.calls.length > 0,
    );
    expect(createUser.handle.mock.calls[0][0]).toMatchObject({
      role: 'inspector',
    });

    const refused = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${tokens[subOf('administrator', true)]}`)
      .send({ ...body, role: 'auditor' });

    expect(refused.status).toBe(400);
  });

  it('inspector C3 POST /invitations accepts role inspector', async () => {
    const response = await request(app.getHttpServer())
      .post('/invitations')
      .set('Authorization', `Bearer ${tokens[subOf('administrator', true)]}`)
      .send({ userId: ID, organizationId: ORGANIZATION, role: 'inspector' });

    expect(response.status).toBe(201);
    const [sendInvitation] = [...fakes.values()].filter(
      (fake) => fake.handle.mock.calls.length > 0,
    );
    expect(sendInvitation.handle.mock.calls[0][0]).toMatchObject({
      role: 'inspector',
    });
  });

  it('inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles', async () => {
    const me = await request(app.getHttpServer()).get('/me');
    expect(me.status).toBe(401);

    const invitation = await request(app.getHttpServer())
      .post('/invitations')
      .set('Authorization', `Bearer ${tokens[subOf('administrator', true)]}`)
      .send({ userId: ID, organizationId: ORGANIZATION, role: 'auditor' });
    expect(invitation.status).toBe(400);

    const roles = await request(app.getHttpServer())
      .get(`/organizations/${ORGANIZATION}/roles`)
      .set('Authorization', `Bearer ${tokens[subOf('administrator')]}`);
    expect(roles.status).toBe(403);
  });
});
