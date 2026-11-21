import { describe, expect, it, vi } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import type { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { makeStaff } from '@test/workforce.js';
import { PrismaStaffRepository } from '../staff.repository.js';

const unique = (fields: string) =>
  new Prisma.PrismaClientKnownRequestError(
    `Unique constraint failed on the fields: (${fields})`,
    { code: 'P2002', clientVersion: '7' },
  );

describe('PrismaStaffRepository', () => {
  it('workforce C1 writes every field of the staff', async () => {
    const create = vi.fn(async (_args: unknown) => ({}));
    const sut = new PrismaStaffRepository({
      staff: { create },
    } as unknown as PrismaService);

    await sut.create(
      makeStaff(
        {
          organizationId: 'A',
          name: 'Rafael Mendes',
          specialty: 'Mecânico naval',
          email: 'rafael@mareos.test',
          phone: '(13) 1',
          teamId: 'team-a',
        },
        'rafael',
      ),
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'rafael',
        organizationId: 'A',
        name: 'Rafael Mendes',
        specialty: 'Mecânico naval',
        email: 'rafael@mareos.test',
        phone: '(13) 1',
        teamId: 'team-a',
      },
    });
  });

  it('workforce C3 reads the staff of the organization ordered by name', async () => {
    const findMany = vi.fn(async (_args: unknown) => [
      {
        id: 'b',
        organizationId: 'A',
        name: 'Bianca Costa',
        specialty: 'Técnica de docagem',
        email: 'b@x.test',
        phone: '1',
        teamId: null,
        createdAt: new Date(),
      },
    ]);
    const sut = new PrismaStaffRepository({
      staff: { findMany },
    } as unknown as PrismaService);

    const staff = await sut.findMany('A');

    expect(findMany).toHaveBeenCalledWith({
      where: { organizationId: 'A' },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    expect(staff[0]).toMatchObject({
      id: 'b',
      name: 'Bianca Costa',
      teamId: null,
    });
  });

  it('workforce C38 turns a unique violation into AlreadyExistsDomainException', async () => {
    const create = vi
      .fn(async (_args: unknown) => ({}))
      .mockRejectedValueOnce(unique('`organizationId`,`name`'))
      .mockRejectedValueOnce(unique('`organizationId`,`email`'))
      .mockRejectedValueOnce(new Error('down'));
    const sut = new PrismaStaffRepository({
      staff: { create },
    } as unknown as PrismaService);

    await expect(sut.create(makeStaff())).rejects.toThrow(
      new AlreadyExistsDomainException('Staff name already exists'),
    );
    await expect(sut.create(makeStaff())).rejects.toThrow(
      'Staff email already exists',
    );
    await expect(sut.create(makeStaff())).rejects.toThrow('down');
  });
});
