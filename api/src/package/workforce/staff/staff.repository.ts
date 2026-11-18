import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import {
  Prisma,
  Staff as PrismaStaff,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IStaffRepository } from './contracts/staff-repository.contract.js';
import { Staff } from './staff.entity.js';

// Two writes of one name or one email at once meet a unique index; the loser answers 409, not 500.
const uniqueTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

const takenField = (error: Prisma.PrismaClientKnownRequestError) =>
  `${error.message} ${JSON.stringify(error.meta ?? {})}`.includes('email')
    ? 'Staff email already exists'
    : 'Staff name already exists';

@Injectable()
export class PrismaStaffRepository implements IStaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(organizationId: string, id: string): Promise<Staff | null> {
    const staff = await this.prisma.staff.findFirst({
      where: { id, organizationId },
    });

    return staff ? this.toDomain(staff) : null;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<Staff | null> {
    const staff = await this.prisma.staff.findUnique({
      where: { organizationId_name: { organizationId, name } },
    });

    return staff ? this.toDomain(staff) : null;
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Staff | null> {
    const staff = await this.prisma.staff.findUnique({
      where: { organizationId_email: { organizationId, email } },
    });

    return staff ? this.toDomain(staff) : null;
  }

  async findMany(organizationId: string): Promise<Staff[]> {
    const rows = await this.prisma.staff.findMany({
      where: { organizationId },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(staff: Staff): Promise<void> {
    try {
      await this.prisma.staff.create({ data: this.toRow(staff) });
    } catch (error) {
      if (uniqueTaken(error)) {
        throw new AlreadyExistsDomainException(
          takenField(error as Prisma.PrismaClientKnownRequestError),
        );
      }

      throw error;
    }
  }

  async save(staff: Staff): Promise<void> {
    const { id, organizationId, ...data } = this.toRow(staff);

    try {
      await this.prisma.staff.update({
        where: { id, organizationId },
        data,
      });
    } catch (error) {
      if (uniqueTaken(error)) {
        throw new AlreadyExistsDomainException(
          takenField(error as Prisma.PrismaClientKnownRequestError),
        );
      }

      throw error;
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.prisma.staff.delete({ where: { id, organizationId } });
  }

  private toRow(staff: Staff) {
    return {
      id: staff.id,
      organizationId: staff.organizationId,
      name: staff.name,
      specialty: staff.specialty,
      email: staff.email,
      phone: staff.phone,
      teamId: staff.teamId,
    };
  }

  private toDomain(row: PrismaStaff): Staff {
    return Staff.create(
      {
        organizationId: row.organizationId,
        name: row.name,
        specialty: row.specialty,
        email: row.email,
        phone: row.phone,
        teamId: row.teamId,
      },
      row.id,
    );
  }
}
