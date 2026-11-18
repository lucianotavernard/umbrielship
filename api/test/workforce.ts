import {
  Assignment,
  AssignmentProps,
} from '@/package/workforce/assignment/assignment.entity.js';
import { Staff, StaffProps } from '@/package/workforce/staff/staff.entity.js';
import { Team, TeamProps } from '@/package/workforce/team/team.entity.js';
import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import { InMemoryAssignmentsRepository } from '@test/repositories/in-memory-assignments-repository.js';
import { InMemoryStaffRepository } from '@test/repositories/in-memory-staff-repository.js';
import { InMemoryTeamsRepository } from '@test/repositories/in-memory-teams-repository.js';

// The workforce context on in-memory repositories, with its facade, for any spec that needs it.
export function inMemoryWorkforce() {
  const staff = new InMemoryStaffRepository();
  const teams = new InMemoryTeamsRepository(staff);
  const assignments = new InMemoryAssignmentsRepository();

  return {
    staff,
    teams,
    assignments,
    facade: new WorkforceFacade(staff, teams, assignments),
  };
}

export const makeStaff = (override: Partial<StaffProps> = {}, id?: string) =>
  Staff.create(
    {
      organizationId: 'org-1',
      name: 'Rafael Mendes',
      specialty: 'Mecânico naval',
      email: 'rafael.mendes@umbriel.test',
      phone: '(13) 99821-4401',
      teamId: null,
      ...override,
    },
    id,
  );

export const makeTeam = (override: Partial<TeamProps> = {}, id?: string) =>
  Team.create(
    {
      organizationId: 'org-1',
      name: 'Equipe Alfa',
      specialty: 'Motor',
      ...override,
    },
    id,
  );

export const makeAssignment = (
  override: Partial<AssignmentProps> = {},
  id?: string,
) =>
  Assignment.create(
    {
      organizationId: 'org-1',
      workOrderId: 'work-order-1',
      workOrderServiceId: 'service-1',
      staffId: 'staff-1',
      teamId: null,
      ...override,
    },
    id,
  );
