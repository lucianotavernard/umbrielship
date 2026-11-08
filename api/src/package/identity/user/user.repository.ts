import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IUsersRepository } from './contracts/user-repository.contract.js';
import { Role, User } from './user.entity.js';

type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  activeOrganizationId: string | null;
  memberships: { organizationId: string; role: Role }[];
};

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      include: { memberships: true },
      where: { email },
    });

    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      include: { memberships: true },
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      include: { memberships: true },
      where: { memberships: { some: { organizationId } } },
      orderBy: { name: 'asc' },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return rows.map((row) => this.toDomain(row));
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.user.count({
      where: { memberships: { some: { organizationId } } },
    });
  }

  async countByOrganizationAndRole(
    organizationId: string,
    role: Role,
  ): Promise<number> {
    return this.prisma.membership.count({ where: { organizationId, role } });
  }

  async findManyOutsideOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      include: { memberships: true },
      where: { memberships: { none: { organizationId } } },
      orderBy: { name: 'asc' },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return rows.map((row) => this.toDomain(row));
  }

  async countOutsideOrganization(organizationId: string): Promise<number> {
    return this.prisma.user.count({
      where: { memberships: { none: { organizationId } } },
    });
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          activeOrganizationId: user.activeOrganizationId,
          memberships: {
            create: user.memberships.map((membership) => ({
              organizationId: membership.organizationId,
              role: membership.role,
            })),
          },
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new AlreadyExistsDomainException('User already exists');
      }

      throw error;
    }
  }

  async update(user: User): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { activeOrganizationId: user.activeOrganizationId },
      });

      for (const membership of user.memberships) {
        await tx.membership.upsert({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: membership.organizationId,
            },
          },
          create: {
            userId: user.id,
            organizationId: membership.organizationId,
            role: membership.role,
          },
          update: { role: membership.role },
        });
      }
    });
  }

  private toDomain(row: UserRow): User {
    return User.create(
      {
        name: row.name,
        email: row.email,
        password: row.password,
        activeOrganizationId: row.activeOrganizationId,
        memberships: row.memberships.map((membership) => ({
          organizationId: membership.organizationId,
          role: membership.role,
        })),
      },
      row.id,
    );
  }
}
