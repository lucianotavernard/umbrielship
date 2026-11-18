import { Team } from '../team.entity.js';

export type TeamWithStaffCount = { team: Team; staffCount: number };

export abstract class ITeamsRepository {
  abstract findById(organizationId: string, id: string): Promise<Team | null>;
  /** Compared without case. */
  abstract findByName(
    organizationId: string,
    name: string,
  ): Promise<Team | null>;
  /** Every Team of the Organization, by name, with the number of Staff whose Team it is. */
  abstract findMany(organizationId: string): Promise<TeamWithStaffCount[]>;
  abstract countStaff(organizationId: string, id: string): Promise<number>;
  abstract create(team: Team): Promise<void>;
  abstract save(team: Team): Promise<void>;
  /** Its Staff are left with no Team. */
  abstract delete(organizationId: string, id: string): Promise<void>;
}
