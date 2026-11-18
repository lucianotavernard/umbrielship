import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import {
  Prisma,
  Team as PrismaTeam,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import {
  ITeamsRepository,
  TeamWithStaffCount,
} from './contracts/team-repository.contract.js';
import { Team } from './team.entity.js';

const nameTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

@Injectable()
export class PrismaTeamsRepository implements ITeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(organizationId: string, id: string): Promise<Team | null> {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
    });

    return team ? this.toDomain(team) : null;
  }

  async findByName(organizationId: string, name: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { organizationId_name: { organizationId, name } },
    });

    return team ? this.toDomain(team) : null;
  }

  async findMany(organizationId: string): Promise<TeamWithStaffCount[]> {
    const rows = await this.prisma.team.findMany({
      where: { organizationId },
      include: { _count: { select: { staff: true } } },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    return rows.map(({ _count, ...row }) => ({
      team: this.toDomain(row),
      staffCount: _count.staff,
    }));
  }

  async countStaff(organizationId: string, id: string): Promise<number> {
    return this.prisma.staff.count({ where: { organizationId, teamId: id } });
  }

  async create(team: Team): Promise<void> {
    try {
      await this.prisma.team.create({
        data: {
          id: team.id,
          organizationId: team.organizationId,
          name: team.name,
          specialty: team.specialty,
        },
      });
    } catch (error) {
      if (nameTaken(error)) {
        throw new AlreadyExistsDomainException('Team name already exists');
      }

      throw error;
    }
  }

  async save(team: Team): Promise<void> {
    try {
      await this.prisma.team.update({
        where: { id: team.id, organizationId: team.organizationId },
        data: { name: team.name, specialty: team.specialty },
      });
    } catch (error) {
      if (nameTaken(error)) {
        throw new AlreadyExistsDomainException('Team name already exists');
      }

      throw error;
    }
  }

  // `staff.teamId` is set null by the foreign key (AD-062).
  async delete(organizationId: string, id: string): Promise<void> {
    await this.prisma.team.delete({ where: { id, organizationId } });
  }

  private toDomain(row: PrismaTeam): Team {
    return Team.create(
      {
        organizationId: row.organizationId,
        name: row.name,
        specialty: row.specialty,
      },
      row.id,
    );
  }
}
