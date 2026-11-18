import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { FetchAssignmentsUseCase } from './fetch-assignments.use-case.js';

// Assignments are written through the WorkOrder routes (AD-073); this one only reads them.
@Controller('/assignments')
export class AssignmentController {
  constructor(private fetchAssignments: FetchAssignmentsUseCase) {}

  @Get()
  async get(@CurrentUser() user: UserPayload) {
    const { assignments } = await this.fetchAssignments.handle({
      organizationId: user.organizationId,
    });

    return {
      assignments: assignments.map(
        ({ id, workOrderId, workOrderServiceId, staffId, teamId }) => ({
          id,
          workOrderId,
          workOrderServiceId,
          staffId,
          teamId,
        }),
      ),
    };
  }
}
