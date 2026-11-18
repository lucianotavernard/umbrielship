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
import { CreateTeamUseCase } from '../create-team.use-case.js';
import { DeleteTeamUseCase } from '../delete-team.use-case.js';
import { FetchTeamsUseCase } from '../fetch-teams.use-case.js';
import { TeamController } from '../team.controller.js';
import { UpdateTeamUseCase } from '../update-team.use-case.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER = '99999999-9999-4999-8999-999999999999';
const ALFA = '44444444-4444-4444-8444-444444444444';
const BRAVO = '45454545-4545-4545-8545-454545454545';
const STRANGER = '55555555-5555-4555-8555-555555555555';
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
    controllers: [TeamController],
    providers: [
      {
        provide: CreateTeamUseCase,
        useValue: new CreateTeamUseCase(workforce.teams),
      },
      {
        provide: DeleteTeamUseCase,
        useValue: new DeleteTeamUseCase(workforce.teams, workforce.assignments),
      },
      {
        provide: FetchTeamsUseCase,
        useValue: new FetchTeamsUseCase(workforce.teams),
      },
      {
        provide: UpdateTeamUseCase,
        useValue: new UpdateTeamUseCase(workforce.teams),
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
    makeTeam(
      {
        organizationId: ORGANIZATION,
        name: 'Equipe Bravo',
        specialty: 'Hidráulica',
      },
      BRAVO,
    ),
    makeTeam(
      { organizationId: ORGANIZATION, name: 'Equipe Alfa', specialty: 'Motor' },
      ALFA,
    ),
    makeTeam({ organizationId: OTHER, name: 'Equipe Zulu' }, STRANGER),
  ];
  workforce.staff.items = [
    makeStaff(
      {
        organizationId: ORGANIZATION,
        name: 'Rafael',
        email: 'r@x.test',
        teamId: ALFA,
      },
      'rafael',
    ),
    makeStaff(
      {
        organizationId: ORGANIZATION,
        name: 'Camila',
        email: 'c@x.test',
        teamId: ALFA,
      },
      'camila',
    ),
  ];
  workforce.assignments.items = [];
});

const agent = () => request(app.getHttpServer());
const auth = (role: Role) => ({ Authorization: `Bearer ${tokens[role]}` });

describe('POST /teams', () => {
  it('workforce C6 answers 201, 400 and 409', async () => {
    const created = await agent()
      .post('/teams')
      .set(auth('administrator'))
      .send({ name: ' Equipe Charlie ', specialty: ' Elétrica ' });
    expect(created.status).toBe(201);
    expect(created.body).toEqual({
      team: {
        id: expect.any(String),
        name: 'Equipe Charlie',
        specialty: 'Elétrica',
      },
    });

    const post = (payload: object) =>
      agent().post('/teams').set(auth('administrator')).send(payload);
    expect(
      (await post({ name: 'x'.repeat(121), specialty: 'Motor' })).status,
    ).toBe(400);
    expect(
      (await post({ name: 'Equipe Delta', specialty: 'x'.repeat(101) })).status,
    ).toBe(400);
    expect((await post({ name: '  ', specialty: 'Motor' })).status).toBe(400);

    const taken = await post({ name: 'equipe alfa', specialty: 'Motor' });
    expect(taken.status).toBe(409);
    expect(taken.body.message).toBe('Team name already exists');
  });
});

describe('GET /teams', () => {
  it('workforce C6 answers the teams with staffCount and 401 without a token', async () => {
    const response = await agent().get('/teams').set(auth('inspector'));

    expect(response.status).toBe(200);
    expect(response.body.teams).toEqual([
      { id: ALFA, name: 'Equipe Alfa', specialty: 'Motor', staffCount: 2 },
      {
        id: BRAVO,
        name: 'Equipe Bravo',
        specialty: 'Hidráulica',
        staffCount: 0,
      },
    ]);
    expect((await agent().get('/teams')).status).toBe(401);
  });
});

describe('PUT /teams/:id', () => {
  it('workforce C6 answers 200 and 404 for another organization', async () => {
    const response = await agent()
      .put(`/teams/${ALFA}`)
      .set(auth('administrator'))
      .send({ name: 'Equipe Alfa', specialty: 'Motor e elétrica' });
    expect(response.status).toBe(200);
    expect(response.body.team).toEqual({
      id: ALFA,
      name: 'Equipe Alfa',
      specialty: 'Motor e elétrica',
    });

    const taken = await agent()
      .put(`/teams/${ALFA}`)
      .set(auth('administrator'))
      .send({ name: 'EQUIPE BRAVO', specialty: 'Motor' });
    expect(taken.status).toBe(409);

    const bounds = await agent()
      .put(`/teams/${ALFA}`)
      .set(auth('administrator'))
      .send({ name: 'Equipe Alfa', specialty: '' });
    expect(bounds.status).toBe(400);

    const other = await agent()
      .put(`/teams/${STRANGER}`)
      .set(auth('administrator'))
      .send({ name: 'x', specialty: 'y' });
    expect(other.status).toBe(404);
    expect(other.body.message).toBe('Team not found');
  });
});

describe('DELETE /teams/:id', () => {
  it('workforce C7 answers 204, 409 and 404', async () => {
    workforce.assignments.items.push(
      makeAssignment({
        organizationId: ORGANIZATION,
        staffId: null,
        teamId: BRAVO,
      }),
    );

    const refused = await agent()
      .delete(`/teams/${BRAVO}`)
      .set(auth('administrator'));
    expect(refused.status).toBe(409);
    expect(refused.body.message).toBe('Team has Assignment');

    expect(
      (await agent().delete(`/teams/${ALFA}`).set(auth('administrator')))
        .status,
    ).toBe(204);
    expect(workforce.staff.items.map((member) => member.teamId)).toEqual([
      null,
      null,
    ]);
    expect(
      (await agent().delete(`/teams/${STRANGER}`).set(auth('administrator')))
        .status,
    ).toBe(404);
  });
});

describe('team writes', () => {
  it('workforce C8 answers 403 to an operator and an inspector on every write', async () => {
    for (const role of ['operator', 'inspector'] as Role[]) {
      const payload = { name: 'Equipe Eco', specialty: 'Motor' };
      expect(
        (await agent().post('/teams').set(auth(role)).send(payload)).status,
      ).toBe(403);
      expect(
        (await agent().put(`/teams/${ALFA}`).set(auth(role)).send(payload))
          .status,
      ).toBe(403);
      expect(
        (await agent().delete(`/teams/${BRAVO}`).set(auth(role))).status,
      ).toBe(403);
    }

    expect(workforce.teams.items).toHaveLength(3);
    expect(workforce.teams.items.find((team) => team.id === ALFA)!.name).toBe(
      'Equipe Alfa',
    );
  });
});
