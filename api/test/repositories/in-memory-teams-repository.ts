import {
  ITeamsRepository,
  TeamWithStaffCount,
} from '@/package/workforce/team/contracts/team-repository.contract.js';
import { Team } from '@/package/workforce/team/team.entity.js';
import { Staff } from '@/package/workforce/staff/staff.entity.js';

import { InMemoryStaffRepository } from '@test/repositories/in-memory-staff-repository.js';

export class InMemoryTeamsRepository implements ITeamsRepository {
  public items: Team[] = [];

  constructor(private readonly staff: InMemoryStaffRepository) {}

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(organizationId: string, id: string): Promise<Team | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findByName(organizationId: string, name: string): Promise<Team | null> {
    return (
      this.of(organizationId).find(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  async findMany(organizationId: string): Promise<TeamWithStaffCount[]> {
    return [...this.of(organizationId)]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => ({
        team,
        staffCount: this.staff.items.filter(
          (member) => member.teamId === team.id,
        ).length,
      }));
  }

  async countStaff(organizationId: string, id: string): Promise<number> {
    return this.staff.items.filter(
      (member) =>
        member.organizationId === organizationId && member.teamId === id,
    ).length;
  }

  async create(team: Team): Promise<void> {
    this.items.push(team);
  }

  async save(team: Team): Promise<void> {
    const index = this.items.findIndex((item) => item.id === team.id);
    this.items[index] = team;
  }

  // As the foreign key does: its Staff are left with no Team.
  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (item) => !(item.id === id && item.organizationId === organizationId),
    );
    this.staff.items = this.staff.items.map((member) =>
      member.teamId === id
        ? Staff.create(
            {
              organizationId: member.organizationId,
              name: member.name,
              specialty: member.specialty,
              email: member.email,
              phone: member.phone,
              teamId: null,
            },
            member.id,
          )
        : member,
    );
  }
}
