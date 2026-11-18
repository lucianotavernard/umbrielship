import { Module } from '@nestjs/common';

import { PrismaModule } from '@/package/shared/module/prisma/prisma.module.js';

import { AssignmentController } from './assignment/assignment.controller.js';
import { PrismaAssignmentsRepository } from './assignment/assignment.repository.js';
import { IAssignmentsRepository } from './assignment/contracts/assignment-repository.contract.js';
import { FetchAssignmentsUseCase } from './assignment/fetch-assignments.use-case.js';
import { IStaffRepository } from './staff/contracts/staff-repository.contract.js';
import { CreateStaffUseCase } from './staff/create-staff.use-case.js';
import { DeleteStaffUseCase } from './staff/delete-staff.use-case.js';
import { FetchStaffUseCase } from './staff/fetch-staff.use-case.js';
import { GetStaffByIdUseCase } from './staff/get-staff-by-id.use-case.js';
import { StaffController } from './staff/staff.controller.js';
import { PrismaStaffRepository } from './staff/staff.repository.js';
import { UpdateStaffUseCase } from './staff/update-staff.use-case.js';
import { ITeamsRepository } from './team/contracts/team-repository.contract.js';
import { CreateTeamUseCase } from './team/create-team.use-case.js';
import { DeleteTeamUseCase } from './team/delete-team.use-case.js';
import { FetchTeamsUseCase } from './team/fetch-teams.use-case.js';
import { TeamController } from './team/team.controller.js';
import { PrismaTeamsRepository } from './team/team.repository.js';
import { UpdateTeamUseCase } from './team/update-team.use-case.js';
import { WorkforceFacade } from './workforce.facade.js';

// Imports no other context (Landing door 3).
@Module({
  imports: [PrismaModule],
  controllers: [StaffController, TeamController, AssignmentController],
  providers: [
    CreateStaffUseCase,
    DeleteStaffUseCase,
    FetchStaffUseCase,
    GetStaffByIdUseCase,
    UpdateStaffUseCase,
    CreateTeamUseCase,
    DeleteTeamUseCase,
    FetchTeamsUseCase,
    UpdateTeamUseCase,
    FetchAssignmentsUseCase,
    WorkforceFacade,
    { provide: IStaffRepository, useClass: PrismaStaffRepository },
    { provide: ITeamsRepository, useClass: PrismaTeamsRepository },
    { provide: IAssignmentsRepository, useClass: PrismaAssignmentsRepository },
  ],
  exports: [WorkforceFacade],
})
export class WorkforceModule {}
