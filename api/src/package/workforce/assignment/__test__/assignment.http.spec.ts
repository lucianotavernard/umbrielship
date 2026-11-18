import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { bootHttp } from '@test/http.js';
import { inMemoryWorkforce, makeAssignment } from '@test/workforce.js';
import { AssignmentController } from '../assignment.controller.js';
import { FetchAssignmentsUseCase } from '../fetch-assignments.use-case.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const SUB = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const users: Record<string, UserPayload> = {
  [SUB]: {
    sub: SUB,
    name: 'Inspector',
    organizationId: ORGANIZATION,
    role: 'inspector',
    internal: false,
  },
};

const workforce = inMemoryWorkforce();
let app: INestApplication;
let token: string;

beforeAll(async () => {
  let sign: (sub: string) => string;
  ({ app, sign } = await bootHttp({
    controllers: [AssignmentController],
    providers: [
      {
        provide: FetchAssignmentsUseCase,
        useValue: new FetchAssignmentsUseCase(workforce.assignments),
      },
    ],
    users,
  }));
  token = sign(SUB);
});

afterAll(async () => {
  await app.close();
});

describe('GET /assignments', () => {
  it('workforce C19 answers the assignments and 401 without a token', async () => {
    workforce.assignments.items.push(
      makeAssignment(
        {
          organizationId: ORGANIZATION,
          workOrderId: 'wo1',
          workOrderServiceId: 's1',
          staffId: 'rafael',
        },
        'a1',
      ),
      makeAssignment(
        { organizationId: 'other', workOrderServiceId: 's9' },
        'a9',
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/assignments')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      assignments: [
        {
          id: 'a1',
          workOrderId: 'wo1',
          workOrderServiceId: 's1',
          staffId: 'rafael',
          teamId: null,
        },
      ],
    });
    expect(
      (await request(app.getHttpServer()).get('/assignments')).status,
    ).toBe(401);
  });
});
