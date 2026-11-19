import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { CreateVesselUseCase } from '../create-vessel.use-case.js';
import { DeleteVesselUseCase } from '../delete-vessel.use-case.js';
import { EditVesselUseCase } from '../edit-vessel.use-case.js';
import { FetchVesselsUseCase } from '../fetch-vessels.use-case.js';
import { GetVesselByIdUseCase } from '../get-vessel-by-id.use-case.js';
import { VesselController } from '../vessel.controller.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
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

describe('GET /vessels', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const vessels = new InMemoryVesselsRepository(
      new InMemoryCustomersRepository(),
    );
    for (let index = 1; index <= 14; index++) {
      vessels.items.push(
        makeVessel(
          {
            organizationId: ORGANIZATION,
            customerId: index <= 3 ? 'c1' : 'c2',
            imoNumber: `${index}`,
          },
          `v${index}`,
        ),
      );
    }
    vessels.items.push(
      makeVessel({ organizationId: OTHER, customerId: 'c1' }, 'other'),
    );

    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [VesselController],
      providers: [
        { provide: CreateVesselUseCase, useValue: {} },
        { provide: DeleteVesselUseCase, useValue: {} },
        { provide: EditVesselUseCase, useValue: {} },
        {
          provide: FetchVesselsUseCase,
          useValue: new FetchVesselsUseCase(vessels),
        },
        { provide: GetVesselByIdUseCase, useValue: {} },
      ],
      users,
    }));
    token = sign(SUB);
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);

  it('customer-ui C35 answers every vessel without page and 10 with page 1', async () => {
    const all = await get('/vessels');
    const ofCustomer = await get('/vessels?customerId=c1');
    const first = await get('/vessels?page=1');

    expect(all.status).toBe(200);
    expect(all.body.vessels).toHaveLength(14);
    expect(all.body.total).toBe(14);
    expect(
      all.body.vessels.map((vessel: { id: string }) => vessel.id),
    ).not.toContain('other');
    expect(ofCustomer.status).toBe(200);
    expect(
      ofCustomer.body.vessels.map((vessel: { id: string }) => vessel.id),
    ).toEqual(['v1', 'v2', 'v3']);
    expect(first.status).toBe(200);
    expect(first.body.vessels).toHaveLength(10);
    expect(first.body.total).toBe(14);
  });

  it('customer-ui C35 answers 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get('/vessels');

    expect(response.status).toBe(401);
  });
});

describe('POST /vessels', () => {
  const WRITER = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const CUSTOMER = '33333333-3333-4333-8333-333333333333';
  let app: INestApplication;
  let token: string;
  const customers = new InMemoryCustomersRepository();
  const vessels = new InMemoryVesselsRepository(customers);
  const body = { customerId: CUSTOMER, imoNumber: '9182451', name: 'Santa Maria', type: 'FISHING', length: 28 };

  beforeAll(async () => {
    customers.items.push(makeCustomer({ organizationId: ORGANIZATION }, CUSTOMER));
    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [VesselController],
      providers: [
        { provide: CreateVesselUseCase, useValue: new CreateVesselUseCase(vessels, customers) },
        { provide: DeleteVesselUseCase, useValue: {} },
        { provide: EditVesselUseCase, useValue: {} },
        { provide: FetchVesselsUseCase, useValue: {} },
        { provide: GetVesselByIdUseCase, useValue: {} },
      ],
      users: {
        [WRITER]: { sub: WRITER, name: 'Operator', organizationId: ORGANIZATION, role: 'operator', internal: false },
      },
    }));
    token = sign(WRITER);
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (payload: object) =>
    request(app.getHttpServer()).post('/vessels').set('Authorization', `Bearer ${token}`).send(payload);

  it('answers 400 and stores nothing for a status that does not exist', async () => {
    const response = await post({ ...body, status: 'BROKEN' });

    expect(response.status).toBe(400);
    expect(vessels.items).toHaveLength(0);
  });

  it('answers 201 with the status given, and ACTIVE when none is given', async () => {
    const given = await post({ ...body, status: 'INACTIVE' });
    const none = await post({ ...body, imoNumber: '9236178', name: 'Lula Branca' });

    expect(given.status).toBe(201);
    expect(given.body.vessel.status).toBe('INACTIVE');
    expect(none.status).toBe(201);
    expect(none.body.vessel.status).toBe('ACTIVE');
  });
});
