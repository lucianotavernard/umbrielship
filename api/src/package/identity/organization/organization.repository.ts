import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

import { IOrganizationsRepository } from './contracts/organization-repository.contract';
import { Organization } from './organization.entity';

type OrganizationRow = {
  id: string;
  name: string;
  email: string;
  isInternal: boolean;
};

@Injectable()
export class PrismaOrganizationsRepository implements IOrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(take: number, skip: number): Promise<Organization[]> {
    const rows = await this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
      take,
      skip,
    });

    return rows.map((row) => this.toDomain(row));
  }

  async count(): Promise<number> {
    return this.prisma.organization.count();
  }

  async findById(id: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { id } });

    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { name } });

    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { email } });

    return row ? this.toDomain(row) : null;
  }

  async save(organization: Organization): Promise<void> {
    try {
      await this.prisma.organization.create({
        data: {
          id: organization.id,
          name: organization.name,
          email: organization.email,
          isInternal: organization.isInternal,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new AlreadyExistsDomainException('Organization already exists');
      }

      throw error;
    }
  }

  private toDomain(row: OrganizationRow): Organization {
    return Organization.create(
      {
        name: row.name,
        email: row.email,
        isInternal: row.isInternal,
      },
      row.id,
    );
  }
}
