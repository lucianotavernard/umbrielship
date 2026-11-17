import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { bootHttp } from '@test/http.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { CustomerController } from '../customer.controller.js';
import { CreateCustomerUseCase } from '../create-customer.use-case.js';
import { DeleteCustomerUseCase } from '../delete-customer.use-case.js';
import { EditCustomerUseCase } from '../edit-customer.use-case.js';
import { FetchCustomersUseCase } from '../fetch-customers.use-case.js';
import { GetCustomerByIdUseCase } from '../get-customer-by-id.use-case.js';

const ORGANIZATION = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const SUB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const users: Record<string, UserPayload> = {
  [SUB]: {
    sub: SUB,
    name: 'Operator',
    organizationId: ORGANIZATION,
    role: 'operator',
    internal: false,
  },
};

describe('GET /customers', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    for (let index = 1; index <= 23; index++) {
      customers.items.push(
        makeCustomer(
          { organizationId: ORGANIZATION, email: `c${index}@a.test` },
          `c${index}`,
        ),
      );
    }
    customers.items.push(
      makeCustomer({ organizationId: OTHER, email: 'c1@a.test' }, 'other'),
    );
    vessels.items.push(
      makeVessel({ organizationId: ORGANIZATION, customerId: 'c3' }, 'v1'),
      makeVessel({ organizationId: ORGANIZATION, customerId: 'c3' }, 'v2'),
    );

    let sign: (sub: string) => string;
    ({ app, sign } = await bootHttp({
      controllers: [CustomerController],
      providers: [
        { provide: CreateCustomerUseCase, useValue: {} },
        { provide: DeleteCustomerUseCase, useValue: {} },
        { provide: EditCustomerUseCase, useValue: {} },
        {
          provide: FetchCustomersUseCase,
          useValue: new FetchCustomersUseCase(customers),
        },
        { provide: GetCustomerByIdUseCase, useValue: {} },
      ],
      users,
    }));
    token = sign(SUB);
  });

  afterAll(async () => {
    await app.close();
  });

  it('customer-ui C13 answers every customer with vesselCount without page and 10 with page 1', async () => {
    const all = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);
    const first = await request(app.getHttpServer())
      .get('/customers?page=1')
      .set('Authorization', `Bearer ${token}`);

    expect(all.status).toBe(200);
    expect(all.body.total).toBe(23);
    expect(all.body.customers).toHaveLength(23);
    expect(
      all.body.customers.map((customer: { id: string }) => customer.id),
    ).not.toContain('other');
    const byId = Object.fromEntries(
      all.body.customers.map(
        (customer: { id: string; vesselCount: number }) => [
          customer.id,
          customer.vesselCount,
        ],
      ),
    );
    expect(byId.c1).toBe(0);
    expect(byId.c3).toBe(2);

    expect(first.status).toBe(200);
    expect(first.body.customers).toHaveLength(10);
    expect(first.body.total).toBe(23);
  });

  it('customer-ui C13 answers 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get('/customers');

    expect(response.status).toBe(401);
  });
});
