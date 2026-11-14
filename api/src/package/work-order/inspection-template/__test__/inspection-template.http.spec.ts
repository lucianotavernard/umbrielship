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

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { CreateInspectionTemplateUseCase } from '../create-inspection-template.use-case.js';
import { DeleteInspectionTemplateUseCase } from '../delete-inspection-template.use-case.js';
import { EditInspectionTemplateUseCase } from '../edit-inspection-template.use-case.js';
import { FetchInspectionTemplatesUseCase } from '../fetch-inspection-templates.use-case.js';
import { GetInspectionTemplateByIdUseCase } from '../get-inspection-template-by-id.use-case.js';
import { InspectionTemplateController } from '../inspection-template.controller.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const ID = '33333333-3333-4333-8333-333333333333';
const ROLES: Role[] = ['administrator', 'operator', 'inspector'];

// The token carries a uuid `sub`; one User per Role.
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

const template = () =>
  makeInspectionTemplate(
    {
      organizationId: ORGANIZATION,
      name: 'Pintura',
      labels: ['A', 'B'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    ID,
  );

const respond = vi.fn(
  async (_input: unknown): Promise<unknown> => ({
    inspectionTemplate: template(),
  }),
);

const fakes = {
  create: { handle: vi.fn(async (input: unknown) => respond(input)) },
  edit: { handle: vi.fn(async (input: unknown) => respond(input)) },
  delete: { handle: vi.fn(async (_input: unknown) => undefined) },
  fetch: {
    handle: vi.fn(async (_input: unknown) => ({
      inspectionTemplates: [template()],
      total: 1,
    })),
  },
  get: { handle: vi.fn(async (input: unknown) => respond(input)) },
};

const calls = () =>
  Object.values(fakes).reduce(
    (total, fake) => total + fake.handle.mock.calls.length,
    0,
  );

const body = (items: number, label = 'Casco limpo', name = 'Pintura') => ({
  name,
  items: Array.from({ length: items }, () => ({ label })),
});

type Write = { method: 'post' | 'put' | 'delete'; path: string };

const writes: Write[] = [
  { method: 'post', path: '/inspection-templates' },
  { method: 'put', path: `/inspection-templates/${ID}` },
  { method: 'delete', path: `/inspection-templates/${ID}` },
];

describe('InspectionTemplate routes over HTTP', () => {
  let app: INestApplication;
  let tokens: Record<string, string>;

  beforeAll(async () => {
    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [InspectionTemplateController],
      providers: [
        { provide: CreateInspectionTemplateUseCase, useValue: fakes.create },
        { provide: EditInspectionTemplateUseCase, useValue: fakes.edit },
        { provide: DeleteInspectionTemplateUseCase, useValue: fakes.delete },
        { provide: FetchInspectionTemplatesUseCase, useValue: fakes.fetch },
        { provide: GetInspectionTemplateByIdUseCase, useValue: fakes.get },
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
    respond.mockClear();
  });

  const send = (route: Write, role: Role, payload?: object) => {
    const call = request(app.getHttpServer())
      [route.method](route.path)
      .set('Authorization', `Bearer ${tokens[role]}`);

    return payload ? call.send(payload) : call;
  };

  it('template C2 trims the name and each label before validating', async () => {
    for (const route of writes.slice(0, 2)) {
      const response = await send(route, 'administrator', {
        name: '  Pintura  ',
        items: [{ label: '  Casco limpo ' }],
      });
      expect(response.status, route.method).not.toBe(400);
    }

    expect(fakes.create.handle.mock.calls[0][0]).toMatchObject({
      name: 'Pintura',
      labels: ['Casco limpo'],
    });
    expect(fakes.edit.handle.mock.calls[0][0]).toMatchObject({
      id: ID,
      name: 'Pintura',
      labels: ['Casco limpo'],
    });

    const spaces = await send(writes[0], 'administrator', {
      name: 'Pintura',
      items: [{ label: '   ' }],
    });
    expect(spaces.status).toBe(400);
  });

  it('template C3 answers 400 outside the limits and passes at them', async () => {
    const refused = [
      body(0),
      body(101),
      body(1, 'x'.repeat(201)),
      body(1, 'Casco', ''),
      body(1, 'Casco', 'n'.repeat(101)),
      { name: 'Pintura' },
    ];
    const accepted = [
      body(100),
      body(1, 'x'.repeat(200)),
      body(1, 'Casco', 'n'.repeat(100)),
    ];

    for (const route of writes.slice(0, 2)) {
      for (const payload of refused) {
        const response = await send(route, 'administrator', payload);
        expect(
          response.status,
          `${route.method} ${JSON.stringify(payload).slice(0, 40)}`,
        ).toBe(400);
      }
    }
    expect(calls()).toBe(0);

    for (const route of writes.slice(0, 2)) {
      for (const payload of accepted) {
        const response = await send(route, 'administrator', payload);
        expect(response.status, route.method).toBe(
          route.method === 'post' ? 201 : 200,
        );
      }
    }
    expect(calls()).toBe(6);
  });

  it('template C5 answers 409 when the name is taken', async () => {
    respond.mockRejectedValueOnce(new AlreadyExistsDomainException('taken'));
    const created = await send(writes[0], 'administrator', body(1));
    expect(created.status).toBe(409);

    respond.mockRejectedValueOnce(new AlreadyExistsDomainException('taken'));
    const edited = await send(writes[1], 'administrator', body(1));
    expect(edited.status).toBe(409);
  });

  it('template C7 answers 204 to a delete', async () => {
    const response = await send(writes[2], 'administrator');

    expect(response.status).toBe(204);
    expect(fakes.delete.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      id: ID,
    });
  });

  it('template C8 answers each template with id, name, itemCount and createdAt', async () => {
    const response = await request(app.getHttpServer())
      .get('/inspection-templates?page=2')
      .set('Authorization', `Bearer ${tokens.operator}`);

    expect(response.status).toBe(200);
    expect(fakes.fetch.handle).toHaveBeenCalledWith({
      organizationId: ORGANIZATION,
      page: 2,
    });
    expect(response.body).toEqual({
      inspectionTemplates: [
        {
          id: ID,
          name: 'Pintura',
          itemCount: 2,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    const invalid = await request(app.getHttpServer())
      .get('/inspection-templates?page=0')
      .set('Authorization', `Bearer ${tokens.operator}`);
    expect(invalid.status).toBe(400);

    const detail = await request(app.getHttpServer())
      .get(`/inspection-templates/${ID}`)
      .set('Authorization', `Bearer ${tokens.inspector}`);
    expect(detail.body.inspectionTemplate).toEqual({
      id: ID,
      name: 'Pintura',
      createdAt: '2026-01-01T00:00:00.000Z',
      items: [
        { id: expect.any(String), label: 'A', position: 0 },
        { id: expect.any(String), label: 'B', position: 1 },
      ],
    });
  });

  it('template C10 answers 404 to get, put and delete of an unknown id', async () => {
    const missing = () => new NotFoundDomainException('not found');

    fakes.get.handle.mockRejectedValueOnce(missing());
    const read = await request(app.getHttpServer())
      .get(`/inspection-templates/${ID}`)
      .set('Authorization', `Bearer ${tokens.administrator}`);
    expect(read.status).toBe(404);

    fakes.edit.handle.mockRejectedValueOnce(missing());
    expect((await send(writes[1], 'administrator', body(1))).status).toBe(404);

    fakes.delete.handle.mockRejectedValueOnce(missing());
    expect((await send(writes[2], 'administrator')).status).toBe(404);
  });

  it('template C11 refuses the 3 write routes to operator and inspector with 403 before validation', async () => {
    for (const role of ['operator', 'inspector'] as const) {
      for (const route of writes) {
        for (const payload of [body(1), { name: '' }]) {
          const response = await send(route, role, payload);

          expect(response.status, `${role} ${route.method}`).toBe(403);
          expect(response.body).toEqual({
            statusCode: 403,
            message: 'Forbidden',
          });
        }
      }
    }
    expect(calls()).toBe(0);

    for (const route of writes) {
      const response = await send(route, 'administrator', body(1));
      expect(response.status, route.method).not.toBe(403);
    }
    expect(calls()).toBe(3);
  });

  it('template C32 answers 401 without a token and lets every Role read', async () => {
    const agent = () => request(app.getHttpServer());
    const anonymous = [
      () => agent().get('/inspection-templates'),
      () => agent().get(`/inspection-templates/${ID}`),
      () => agent().post('/inspection-templates').send(body(1)),
      () => agent().put(`/inspection-templates/${ID}`).send(body(1)),
      () => agent().delete(`/inspection-templates/${ID}`),
    ];

    for (const [index, call] of anonymous.entries()) {
      expect((await call()).status, `route ${index}`).toBe(401);
    }

    for (const role of ROLES) {
      for (const path of [
        '/inspection-templates',
        `/inspection-templates/${ID}`,
      ]) {
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(response.status, `${role} ${path}`).toBe(200);
      }
    }
  });
});
