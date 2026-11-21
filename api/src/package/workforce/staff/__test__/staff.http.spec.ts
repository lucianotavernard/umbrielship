import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

import { bootHttp } from '@test/http.js';
import {
  inMemoryWorkforce,
  makeAssignment,
  makeStaff,
  makeTeam,
} from '@test/workforce.js';
import { CreateStaffUseCase } from '../create-staff.use-case.js';
import { DeleteStaffUseCase } from '../delete-staff.use-case.js';
import { FetchStaffUseCase } from '../fetch-staff.use-case.js';
import { GetStaffByIdUseCase } from '../get-staff-by-id.use-case.js';
import { StaffController } from '../staff.controller.js';
import { UpdateStaffUseCase } from '../update-staff.use-case.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER = '99999999-9999-4999-8999-999999999999';
const TEAM = '44444444-4444-4444-8444-444444444444';
const OTHER_TEAM = '55555555-5555-4555-8555-555555555555';
const RAFAEL = '66666666-6666-4666-8666-666666666666';
const CAMILA = '77777777-7777-4777-8777-777777777777';
const STRANGER = '88888888-8888-4888-8888-888888888888';
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

const workforce = inMemoryWorkforce();
let app: INestApplication;
let tokens: Record<Role, string>;

beforeAll(async () => {
  let sign: (sub: string) => string;
  ({ app, sign } = await bootHttp({
    controllers: [StaffController],
    providers: [
      {
        provide: CreateStaffUseCase,
        useValue: new CreateStaffUseCase(workforce.staff, workforce.teams),
      },
      {
        provide: DeleteStaffUseCase,
        useValue: new DeleteStaffUseCase(
          workforce.staff,
          workforce.assignments,
        ),
      },
      {
        provide: FetchStaffUseCase,
        useValue: new FetchStaffUseCase(workforce.staff),
      },
      {
        provide: GetStaffByIdUseCase,
        useValue: new GetStaffByIdUseCase(workforce.staff),
      },
      {
        provide: UpdateStaffUseCase,
        useValue: new UpdateStaffUseCase(workforce.staff, workforce.teams),
      },
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
  workforce.teams.items = [
    makeTeam({ organizationId: ORGANIZATION }, TEAM),
    makeTeam({ organizationId: OTHER }, OTHER_TEAM),
  ];
  workforce.staff.items = [
    makeStaff(
      {
        organizationId: ORGANIZATION,
        name: 'Rafael Mendes',
        email: 'rafael@mareos.test',
      },
      RAFAEL,
    ),
    makeStaff(
      {
        organizationId: ORGANIZATION,
        name: 'Camila Rocha',
        email: 'camila@mareos.test',
      },
      CAMILA,
    ),
    makeStaff(
      { organizationId: OTHER, name: 'Ana Souza', email: 'ana@mareos.test' },
      STRANGER,
    ),
  ];
  workforce.assignments.items = [];
});

const agent = () => request(app.getHttpServer());
const auth = (role: Role) => ({ Authorization: `Bearer ${tokens[role]}` });
const body = (override: object = {}) => ({
  name: 'Marina Alves',
  specialty: 'Técnica de manutenção',
  email: 'marina@mareos.test',
  phone: '(13) 99154-6620',
  ...override,
});

describe('POST /staff', () => {
  it('workforce C1 answers 201 with the staff', async () => {
    const response = await agent()
      .post('/staff')
      .set(auth('administrator'))
      .send(
        body({
          name: ' Marina Alves ',
          email: ' Marina@Mareos.test ',
          teamId: TEAM,
        }),
      );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      staff: {
        id: expect.any(String),
        name: 'Marina Alves',
        specialty: 'Técnica de manutenção',
        email: 'marina@mareos.test',
        phone: '(13) 99154-6620',
        teamId: TEAM,
      },
    });

    const noTeam = await agent()
      .post('/staff')
      .set(auth('administrator'))
      .send(body({ name: 'Pedro', email: 'pedro@mareos.test' }));
    expect(noTeam.status).toBe(201);
    expect(noTeam.body.staff.teamId).toBeNull();
  });

  it('workforce C2 answers 400 for out of bounds fields and 409 for a used name', async () => {
    const post = (payload: object) =>
      agent().post('/staff').set(auth('administrator')).send(payload);

    expect((await post(body({ name: 'x'.repeat(121) }))).status).toBe(400);
    expect((await post(body({ name: 'x'.repeat(120) }))).status).toBe(201);
    expect(
      (
        await post(
          body({ specialty: 'x'.repeat(101), email: 'a1@x.test', name: 'a1' }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await post(
          body({ phone: '1'.repeat(31), email: 'a2@x.test', name: 'a2' }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await post(body({ email: 'not-an-email', name: 'a3' }))).status,
    ).toBe(400);
    expect((await post(body({ name: '   ', email: 'a4@x.test' }))).status).toBe(
      400,
    );
    expect(
      (
        await post(
          body({ name: 'a5', email: `${'a'.repeat(245)}@mareos.test` }),
        )
      ).status,
    ).toBe(400);
    const { phone: _phone, ...missingPhone } = body({
      name: 'a6',
      email: 'a6@x.test',
    });
    expect((await post(missingPhone)).status).toBe(400);
    expect(
      workforce.staff.items.some((item) =>
        ['a1', 'a2', 'a3', 'a5', 'a6'].includes(item.name),
      ),
    ).toBe(false);

    const used = await post(
      body({ name: 'RAFAEL MENDES', email: 'r2@x.test' }),
    );
    expect(used.status).toBe(409);
    expect(used.body.message).toBe('Staff name already exists');

    const email = await post(
      body({ name: 'Novo', email: 'CAMILA@mareos.test' }),
    );
    expect(email.status).toBe(409);
    expect(email.body.message).toBe('Staff email already exists');

    const team = await post(
      body({ name: 'Novo 2', email: 'n2@x.test', teamId: OTHER_TEAM }),
    );
    expect(team.status).toBe(404);
    expect(team.body.message).toBe('Team not found');
  });
});

describe('GET /staff', () => {
  it('workforce C3 answers the staff by name to every role and 401 without a token', async () => {
    for (const role of ROLES) {
      const response = await agent().get('/staff').set(auth(role));

      expect(response.status).toBe(200);
      expect(
        response.body.staff.map((item: { id: string }) => item.id),
      ).toEqual([CAMILA, RAFAEL]);
    }

    expect((await agent().get('/staff')).status).toBe(401);
  });
});

describe('GET /staff/:id', () => {
  it('workforce C3 answers the staff and 404 for another organization', async () => {
    const own = await agent().get(`/staff/${RAFAEL}`).set(auth('inspector'));
    expect(own.status).toBe(200);
    expect(own.body.staff).toMatchObject({ id: RAFAEL, name: 'Rafael Mendes' });

    const other = await agent()
      .get(`/staff/${STRANGER}`)
      .set(auth('administrator'));
    expect(other.status).toBe(404);
    expect(other.body.message).toBe('Staff not found');
  });
});

describe('PUT /staff/:id', () => {
  it('workforce C4 answers 200 with the new values and 404 for another organization', async () => {
    const response = await agent()
      .put(`/staff/${RAFAEL}`)
      .set(auth('administrator'))
      .send(
        body({
          name: 'Rafael Mendes',
          email: 'rafael@mareos.test',
          specialty: 'Mecânica naval',
          teamId: TEAM,
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body.staff).toMatchObject({
      id: RAFAEL,
      specialty: 'Mecânica naval',
      teamId: TEAM,
    });

    const read = await agent().get(`/staff/${RAFAEL}`).set(auth('operator'));
    expect(read.body.staff).toMatchObject({
      specialty: 'Mecânica naval',
      teamId: TEAM,
    });

    const other = await agent()
      .put(`/staff/${STRANGER}`)
      .set(auth('administrator'))
      .send(body());
    expect(other.status).toBe(404);
  });
});

describe('DELETE /staff/:id', () => {
  it('workforce C5 answers 204, 409 and 404', async () => {
    workforce.assignments.items.push(
      makeAssignment({ organizationId: ORGANIZATION, staffId: RAFAEL }),
    );

    const refused = await agent()
      .delete(`/staff/${RAFAEL}`)
      .set(auth('administrator'));
    expect(refused.status).toBe(409);
    expect(refused.body.message).toBe('Staff has Assignment');

    expect(
      (await agent().delete(`/staff/${CAMILA}`).set(auth('administrator')))
        .status,
    ).toBe(204);
    expect(
      (await agent().delete(`/staff/${STRANGER}`).set(auth('administrator')))
        .status,
    ).toBe(404);
    expect(workforce.staff.items.map((item) => item.id).sort()).toEqual(
      [RAFAEL, STRANGER].sort(),
    );
  });
});

describe('staff writes', () => {
  it('workforce C8 answers 403 to an operator and an inspector on every write', async () => {
    for (const role of ['operator', 'inspector'] as Role[]) {
      expect(
        (await agent().post('/staff').set(auth(role)).send(body())).status,
      ).toBe(403);
      expect(
        (await agent().put(`/staff/${RAFAEL}`).set(auth(role)).send(body()))
          .status,
      ).toBe(403);
      expect(
        (await agent().delete(`/staff/${CAMILA}`).set(auth(role))).status,
      ).toBe(403);
    }

    expect(workforce.staff.items).toHaveLength(3);
    expect(workforce.staff.items.find((item) => item.id === RAFAEL)!.name).toBe(
      'Rafael Mendes',
    );
  });
});
