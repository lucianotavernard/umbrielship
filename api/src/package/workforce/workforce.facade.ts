import { Injectable } from '@nestjs/common';

import { Assignment } from './assignment/assignment.entity.js';
import { IAssignmentsRepository } from './assignment/contracts/assignment-repository.contract.js';
import { IStaffRepository } from './staff/contracts/staff-repository.contract.js';
import { ITeamsRepository } from './team/contracts/team-repository.contract.js';

export type StaffSummary = { id: string; name: string; specialty: string };
export type TeamSummary = { id: string; name: string; specialty: string };
export type AssigneeSummary = {
  workOrderServiceId: string;
  staffId: string | null;
  teamId: string | null;
};

// The only way another context reaches workforce: plain data in and out (Landing door 3).
@Injectable()
export class WorkforceFacade {
  constructor(
    private readonly staffRepository: IStaffRepository,
    private readonly teamsRepository: ITeamsRepository,
    private readonly assignmentsRepository: IAssignmentsRepository,
  ) {}

  async findStaffById(
    organizationId: string,
    id: string,
  ): Promise<StaffSummary | null> {
    const staff = await this.staffRepository.findById(organizationId, id);
    return staff
      ? { id: staff.id, name: staff.name, specialty: staff.specialty }
      : null;
  }

  async findTeamById(
    organizationId: string,
    id: string,
  ): Promise<TeamSummary | null> {
    const team = await this.teamsRepository.findById(organizationId, id);
    return team
      ? { id: team.id, name: team.name, specialty: team.specialty }
      : null;
  }

  async findAssigneesByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<AssigneeSummary[]> {
    const assignments = await this.assignmentsRepository.findManyByWorkOrderId(
      organizationId,
      workOrderId,
    );

    return assignments.map(({ workOrderServiceId, staffId, teamId }) => ({
      workOrderServiceId,
      staffId,
      teamId,
    }));
  }

  /** Makes the Staff or the Team the one Assignment of the WorkOrderService. */
  async assign(
    organizationId: string,
    input: {
      workOrderId: string;
      workOrderServiceId: string;
      staffId: string | null;
      teamId: string | null;
    },
  ): Promise<void> {
    await this.assignmentsRepository.put(
      Assignment.create({ organizationId, ...input }),
    );
  }

  async unassign(
    organizationId: string,
    workOrderServiceId: string,
  ): Promise<void> {
    await this.assignmentsRepository.deleteByWorkOrderServiceId(
      organizationId,
      workOrderServiceId,
    );
  }

  async removeByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<void> {
    await this.assignmentsRepository.deleteByWorkOrderId(
      organizationId,
      workOrderId,
    );
  }
}
