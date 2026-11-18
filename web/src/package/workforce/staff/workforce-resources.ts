import { httpResource } from '@angular/common/http';
import { computed, effect, untracked } from '@angular/core';

import { apiErrorMessage } from '../../shared/components/lib/api-error-message';
import { resourceValue } from '../../shared/components/lib/resource-value';
import { toast } from '../../shared/components/ui/toaster';
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

  /**
   * True once every read the page asked for has answered. Until then a page shows no Responsável
   * and an edit sends none, so an unloaded read never reads as "Sem responsável".
   */
  const ready = computed(
    () => !!resourceValue(staff) && !!resourceValue(teams) && (!withAssignments || !!resourceValue(assignments)),
  );
  const error = computed(() => staff.error() ?? teams.error() ?? (withAssignments ? assignments.error() : undefined));

  effect(() => {
    const failed = error();
    if (!failed) return;
    // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
    untracked(() =>
      toast.error('Erro ao carregar os responsáveis', {
        description: apiErrorMessage(failed as { error?: unknown }, 'Não foi possível carregar os responsáveis.'),
      }),
    );
  });

  return {
    ready,
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
