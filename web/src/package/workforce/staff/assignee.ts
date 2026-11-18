import { Assignment, Staff, Team } from './staff.service';

/** A choice of "Responsável": `staff:<id>`, `team:<id>` or "" for "Sem responsável". */
export type AssigneeKey = string;

export type AssigneeOption = { key: AssigneeKey; label: string };

/** "Sem responsável", then the groups "Profissionais" and "Equipes", each "<nome> · <especialidade>" (AD-083). */
export function assigneeGroups(staff: Pick<Staff, 'id' | 'name' | 'specialty'>[], teams: Pick<Team, 'id' | 'name' | 'specialty'>[]) {
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'pt-BR');
  return {
    staff: [...staff].sort(byName).map((item) => ({ key: `staff:${item.id}`, label: `${item.name} · ${item.specialty}` })),
    teams: [...teams].sort(byName).map((item) => ({ key: `team:${item.id}`, label: `${item.name} · ${item.specialty}` })),
  };
}

export function assigneeKeyOf(assignment: Pick<Assignment, 'staffId' | 'teamId'> | undefined): AssigneeKey {
  if (!assignment) return '';
  if (assignment.staffId) return `staff:${assignment.staffId}`;
  if (assignment.teamId) return `team:${assignment.teamId}`;
  return '';
}

/** The ids a request carries for a choice; "" carries neither. */
export function assigneeIds(key: AssigneeKey): { staffId?: string; teamId?: string } {
  if (key.startsWith('staff:')) return { staffId: key.slice('staff:'.length) };
  if (key.startsWith('team:')) return { teamId: key.slice('team:'.length) };
  return {};
}

/** "Responsável: <nome>", "Responsável: Equipe <nome>" or "Sem responsável" (AD-083). */
export function responsavelLabel(
  assignment: Pick<Assignment, 'staffId' | 'teamId'> | undefined,
  staffNames: ReadonlyMap<string, string>,
  teamNames: ReadonlyMap<string, string>,
): string {
  if (assignment?.staffId && staffNames.has(assignment.staffId)) {
    return `Responsável: ${staffNames.get(assignment.staffId)}`;
  }
  if (assignment?.teamId && teamNames.has(assignment.teamId)) {
    return `Responsável: Equipe ${teamNames.get(assignment.teamId)}`;
  }
  return 'Sem responsável';
}
