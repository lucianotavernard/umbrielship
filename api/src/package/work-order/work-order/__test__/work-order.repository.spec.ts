import { describe, expect, it, vi } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeService, makeWorkOrder } from '@test/factory.js';
import { PrismaWorkOrdersRepository } from '../work-order.repository.js';

const day = (date: string) => new Date(`${date}T00:00:00.000Z`);

// A Prisma write is a query object that $transaction runs; each call answers a distinct token.
const queryOf = (model: string) => vi.fn((args: unknown) => ({ model, args }));

describe('PrismaWorkOrdersRepository', () => {
  it('inspection C34 turns the database refusal into ConflictDomainException', async () => {
    const remove = vi
      .fn(async (_args: unknown) => ({}))
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Foreign key constraint violated',
          {
            code: 'P2003',
            clientVersion: '7',
          },
        ),
      )
      .mockRejectedValueOnce(new Error('down'));
    const sut = new PrismaWorkOrdersRepository({
      workOrder: { delete: remove },
    } as unknown as PrismaService);

    await expect(sut.delete('id-1')).rejects.toThrow(ConflictDomainException);
    await expect(sut.delete('id-1')).rejects.toThrow('down');
    expect(remove).toHaveBeenCalledWith({ where: { id: 'id-1' } });
  });

  it('work-order-ui C2 reads every work order with its services by start date then name', async () => {
    const row = {
      id: 'wo-1',
      organizationId: 'org-1',
      vesselId: 'v1',
      startDate: day('2026-06-01'),
      endDate: day('2026-06-20'),
      status: 'IN_PROGRESS',
      services: [
        {
          id: 's-motor',
          name: 'Motor',
          startDate: day('2026-06-02'),
          endDate: day('2026-06-05'),
          status: 'PENDING',
        },
        {
          id: 's-pintura',
          name: 'Pintura',
          startDate: day('2026-06-10'),
          endDate: day('2026-06-12'),
          status: 'COMPLETED',
        },
      ],
    };
    const findMany = vi.fn(async (_args: unknown) => [row]);
    const count = vi.fn(async (_args: unknown) => 14);
    const sut = new PrismaWorkOrdersRepository({
      workOrder: { findMany, count },
    } as unknown as PrismaService);
    const include = {
      services: {
        where: { organizationId: 'org-1' },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
        },
        orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
      },
    };

    const all = await sut.findMany('org-1');

    expect(findMany).toHaveBeenNthCalledWith(1, {
      where: { organizationId: 'org-1' },
      include,
    });
    expect(findMany.mock.calls[0][0]).not.toHaveProperty('take');
    expect(findMany.mock.calls[0][0]).not.toHaveProperty('skip');
    expect(count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
    expect(all).toEqual({
      total: 14,
      data: [
        {
          id: 'wo-1',
          organizationId: 'org-1',
          vesselId: 'v1',
          startDate: day('2026-06-01'),
          endDate: day('2026-06-20'),
          status: 'IN_PROGRESS',
          services: [
            {
              id: 's-motor',
              name: 'Motor',
              startDate: day('2026-06-02'),
              endDate: day('2026-06-05'),
              status: 'PENDING',
            },
            {
              id: 's-pintura',
              name: 'Pintura',
              startDate: day('2026-06-10'),
              endDate: day('2026-06-12'),
              status: 'COMPLETED',
            },
          ],
        },
      ],
    });

    await sut.findMany('org-1', 10, 0);
    expect(findMany).toHaveBeenNthCalledWith(2, {
      where: { organizationId: 'org-1' },
      include,
      take: 10,
      skip: 0,
    });

    await sut.findManyByVesselId('org-1', 'v1');
    expect(findMany).toHaveBeenNthCalledWith(3, {
      where: { organizationId: 'org-1', vesselId: 'v1' },
      include,
    });
    expect(findMany.mock.calls[2][0]).not.toHaveProperty('take');
  });

  it('work-order-ui C21 writes the work order and its services in one transaction', async () => {
    const create = queryOf('workOrder');
    const createMany = queryOf('workOrderService');
    const $transaction = vi.fn(async (operations: unknown[]) =>
      operations.map(() => ({})),
    );
    const sut = new PrismaWorkOrdersRepository({
      workOrder: { create },
      workOrderService: { createMany },
      $transaction,
    } as unknown as PrismaService);
    const workOrder = makeWorkOrder(
      {
        vesselId: 'v1',
        startDate: day('2026-11-17'),
        endDate: day('2026-11-20'),
        status: 'IN_PROGRESS',
      },
      'wo-1',
    );
    const period = {
      startDate: workOrder.startDate,
      endDate: workOrder.endDate,
    };
    const services = [
      makeService(
        {
          workOrderId: 'wo-1',
          name: 'Pintura',
          description: 'Casco',
          ...period,
        },
        's1',
      ),
      makeService(
        {
          workOrderId: 'wo-1',
          name: 'Motor',
          description: 'Revisão',
          ...period,
        },
        's2',
      ),
    ];

    await sut.create(workOrder, services);

    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'wo-1',
        organizationId: 'org-1',
        vesselId: 'v1',
        startDate: day('2026-11-17'),
        endDate: day('2026-11-20'),
        status: 'IN_PROGRESS',
      },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          id: 's1',
          organizationId: 'org-1',
          workOrderId: 'wo-1',
          name: 'Pintura',
          description: 'Casco',
          startDate: day('2026-11-17'),
          endDate: day('2026-11-20'),
          status: 'PENDING',
        },
        {
          id: 's2',
          organizationId: 'org-1',
          workOrderId: 'wo-1',
          name: 'Motor',
          description: 'Revisão',
          startDate: day('2026-11-17'),
          endDate: day('2026-11-20'),
          status: 'PENDING',
        },
      ],
    });
    expect($transaction).toHaveBeenCalledTimes(1);
    const [operations] = $transaction.mock.calls[0];
    expect(operations).toHaveLength(2);
    expect(operations[0]).toBe(create.mock.results[0].value);
    expect(operations[1]).toBe(createMany.mock.results[0].value);

    // No services: the single write of today, with no transaction.
    await sut.create(makeWorkOrder({}, 'wo-2'));
    expect(create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({ id: 'wo-2' }),
    });
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(createMany).toHaveBeenCalledTimes(1);
  });
});
