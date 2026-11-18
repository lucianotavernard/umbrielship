import { Injectable } from '@nestjs/common';

import { Assignment as PrismaAssignment } from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { Assignment } from './assignment.entity.js';
import { IAssignmentsRepository } from './contracts/assignment-repository.contract.js';

@Injectable()
export class PrismaAssignmentsRepository implements IAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(organizationId: string): Promise<Assignment[]> {
    const rows = await this.prisma.assignment.findMany({
      where: { organizationId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<Assignment[]> {
    const rows = await this.prisma.assignment.findMany({
      where: { organizationId, workOrderId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async countByStaffId(
    organizationId: string,
    staffId: string,
  ): Promise<number> {
    return this.prisma.assignment.count({ where: { organizationId, staffId } });
  }

  async countByTeamId(organizationId: string, teamId: string): Promise<number> {
    return this.prisma.assignment.count({ where: { organizationId, teamId } });
  }

  // `workOrderServiceId` is unique: an upsert keeps one row per service even under concurrent writes.
  async put(assignment: Assignment): Promise<void> {
    await this.prisma.assignment.upsert({
      where: { workOrderServiceId: assignment.workOrderServiceId },
      create: {
        id: assignment.id,
        organizationId: assignment.organizationId,
        workOrderId: assignment.workOrderId,
        workOrderServiceId: assignment.workOrderServiceId,
        staffId: assignment.staffId,
        teamId: assignment.teamId,
      },
      update: { staffId: assignment.staffId, teamId: assignment.teamId },
    });
  }

  async deleteByWorkOrderServiceId(
    organizationId: string,
    workOrderServiceId: string,
  ): Promise<void> {
    await this.prisma.assignment.deleteMany({
      where: { organizationId, workOrderServiceId },
    });
  }

  async deleteByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<void> {
    await this.prisma.assignment.deleteMany({
      where: { organizationId, workOrderId },
    });
  }

  private toDomain(row: PrismaAssignment): Assignment {
    return Assignment.create(
      {
        organizationId: row.organizationId,
        workOrderId: row.workOrderId,
        workOrderServiceId: row.workOrderServiceId,
        staffId: row.staffId,
        teamId: row.teamId,
      },
      row.id,
    );
  }
}
