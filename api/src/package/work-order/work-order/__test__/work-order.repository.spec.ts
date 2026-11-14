import { describe, expect, it, vi } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { PrismaWorkOrdersRepository } from '../work-order.repository.js';

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
});
