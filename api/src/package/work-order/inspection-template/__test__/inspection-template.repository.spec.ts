import { describe, expect, it, vi } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { PrismaInspectionTemplatesRepository } from '../inspection-template.repository.js';

// A Prisma client that records the queries the repository sends.
const fakePrisma = () => {
  const inspectionTemplate = {
    count: vi.fn(async (_args: unknown) => 0),
    findMany: vi.fn(async (_args: unknown) => []),
    findFirst: vi.fn(async (_args: unknown) => null),
    findUnique: vi.fn(async (_args: unknown) => null),
    create: vi.fn(async (_args: unknown) => ({})),
    update: vi.fn(async (_args: unknown) => ({})),
    deleteMany: vi.fn(async (_args: unknown) => ({ count: 0 })),
  };
  const inspectionTemplateItem = {
    deleteMany: vi.fn(async (_args: unknown) => ({ count: 0 })),
    createMany: vi.fn(async (_args: unknown) => ({ count: 0 })),
  };
  const prisma = {
    inspectionTemplate,
    inspectionTemplateItem,
    $transaction: vi.fn(async (queries: Promise<unknown>[]) =>
      Promise.all(queries),
    ),
  };

  return {
    prisma,
    sut: new PrismaInspectionTemplatesRepository(
      prisma as unknown as PrismaService,
    ),
  };
};

describe('PrismaInspectionTemplatesRepository', () => {
  it("template C8 asks for the Organization's templates newest first, ties by id", async () => {
    const { prisma, sut } = fakePrisma();

    await sut.findMany('org-1', 10, 10);

    expect(prisma.inspectionTemplate.count).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
    });
    expect(prisma.inspectionTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10,
        skip: 10,
      }),
    );
  });

  it('template C9 reads a template with its items ordered by position', async () => {
    const { prisma, sut } = fakePrisma();
    prisma.inspectionTemplate.findFirst.mockResolvedValueOnce({
      id: 't1',
      organizationId: 'org-1',
      name: 'Pintura',
      createdAt: new Date(2026, 0, 1),
      items: [
        {
          id: 'i2',
          organizationId: 'org-1',
          templateId: 't1',
          label: 'B',
          position: 1,
        },
        {
          id: 'i1',
          organizationId: 'org-1',
          templateId: 't1',
          label: 'A',
          position: 0,
        },
      ],
    } as never);

    const template = await sut.findById('org-1', 't1');

    expect(prisma.inspectionTemplate.findFirst).toHaveBeenCalledWith({
      include: { items: { orderBy: { position: 'asc' } } },
      where: { id: 't1', organizationId: 'org-1' },
    });
    expect(template!.items.map((item) => item.label)).toEqual(['A', 'B']);
  });

  it('template C31 locks the template before replacing its items, so concurrent edits wait', async () => {
    const { prisma, sut } = fakePrisma();
    const order: string[] = [];
    prisma.inspectionTemplate.update.mockImplementationOnce(async () => {
      order.push('update template');
      return {};
    });
    prisma.inspectionTemplateItem.deleteMany.mockImplementationOnce(
      async () => {
        order.push('delete items');
        return { count: 2 };
      },
    );
    prisma.inspectionTemplateItem.createMany.mockImplementationOnce(
      async () => {
        order.push('create items');
        return { count: 2 };
      },
    );
    const template = makeInspectionTemplate({ labels: ['A', 'B'] }, 't1');

    await sut.save(template);

    expect(order).toEqual(['update template', 'delete items', 'create items']);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.inspectionTemplate.update).toHaveBeenCalledWith({
      where: { id: 't1', organizationId: 'org-1' },
      data: { name: 'Pintura do casco' },
    });
    expect(prisma.inspectionTemplateItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          templateId: 't1',
          organizationId: 'org-1',
          label: 'A',
          position: 0,
        }),
        expect.objectContaining({
          templateId: 't1',
          organizationId: 'org-1',
          label: 'B',
          position: 1,
        }),
      ],
    });
  });

  it('template C31 turns the unique name violation into AlreadyExistsDomainException', async () => {
    const { prisma, sut } = fakePrisma();
    const taken = () =>
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7',
      });
    prisma.inspectionTemplate.create.mockRejectedValueOnce(taken());
    prisma.inspectionTemplate.update.mockRejectedValueOnce(taken());

    await expect(sut.create(makeInspectionTemplate())).rejects.toBeInstanceOf(
      AlreadyExistsDomainException,
    );
    await expect(sut.save(makeInspectionTemplate())).rejects.toBeInstanceOf(
      AlreadyExistsDomainException,
    );

    prisma.inspectionTemplate.create.mockRejectedValueOnce(new Error('down'));
    await expect(sut.create(makeInspectionTemplate())).rejects.toThrow('down');
  });
});
