import { httpResource } from '@angular/common/http';
import { computed } from '@angular/core';

import { resourceValue } from '../../shared/components/lib/resource-value';
import { assigneeGroups } from './assignee';
import { AssigneeOptions } from './components/assignee-select';
import { GetAssignmentsResponse, GetStaffListResponse, GetTeamsResponse } from './staff.service';

/**
 * The Staff, Teams and Assignments a page reads to show or choose a "Responsável", requested only
 * while `enabled` holds. Call it in an injection context (a field initializer).
 */
export function workforceResources(enabled: () => boolean, { withAssignments = true } = {}) {
  const staff = httpResource<GetStaffListResponse>(() => (enabled() ? '/api/staff' : undefined));
  const teams = httpResource<GetTeamsResponse>(() => (enabled() ? '/api/teams' : undefined));
  const assignments = httpResource<GetAssignmentsResponse>(() =>
    enabled() && withAssignments ? '/api/assignments' : undefined,
  );

  const staffList = computed(() => resourceValue(staff)?.staff ?? []);
  const teamList = computed(() => resourceValue(teams)?.teams ?? []);

  return {
    staff,
    teams,
    assignments,
    options: computed<AssigneeOptions>(() => assigneeGroups(staffList(), teamList())),
    staffNames: computed(() => new Map(staffList().map((item) => [item.id, item.name]))),
    teamNames: computed(() => new Map(teamList().map((item) => [item.id, item.name]))),
    byService: computed(
      () => new Map((resourceValue(assignments)?.assignments ?? []).map((item) => [item.workOrderServiceId, item])),
    ),
    reload: () => assignments.reload(),
  };
}
