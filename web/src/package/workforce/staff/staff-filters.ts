import { twoDigits } from '../../shared/components/ui/metric';
import { WorkforceStatus } from './staff-status';
import { Staff } from './staff.service';

/** A Staff as the list shows it: with its Team's name and its status joined in the browser. */
export type StaffRow = Staff & { teamName: string; status: WorkforceStatus };

/** "Sem equipe" in the filter and the EQUIPE column (AD-075). */
export const NO_TEAM = 'Sem equipe';
/** The filter value of "Sem equipe": no Team id is empty. */
export const NO_TEAM_FILTER = '__none__';
export const ALL_TEAMS = '';

const fold = (text: string) => text.toLocaleLowerCase('pt-BR');
const byName = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

/** By name in `pt-BR`. */
export function sortStaff<T extends Pick<Staff, 'name'>>(rows: T[]): T[] {
  return [...rows].sort((a, b) => byName(a.name, b.name));
}

/** "Profissionais cadastrados", "Equipes cadastradas" (AD-080) and "Disponíveis agora", two digits each. */
export function staffMetrics(rows: Pick<StaffRow, 'status'>[], teamCount: number) {
  return {
    staff: twoDigits(rows.length),
    teams: twoDigits(teamCount),
    available: twoDigits(rows.filter((row) => row.status === 'Disponível').length),
  };
}

/** Each specialty with how many Staff have it, in `pt-BR` order. */
export function specialtyChips(rows: Pick<Staff, 'specialty'>[]): { specialty: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.specialty, (counts.get(row.specialty) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => byName(a, b))
    .map(([specialty, count]) => ({ specialty, count }));
}

/**
 * The rows of `team` ("" for all, `NO_TEAM_FILTER` for none) and `specialty` (null for all) whose
 * name, specialty, team name or email contains `search`, without case.
 */
export function filterStaff(
  rows: StaffRow[],
  team: string,
  specialty: string | null,
  search: string,
): StaffRow[] {
  const term = fold(search.trim());
  return rows.filter((row) => {
    if (team === NO_TEAM_FILTER && row.teamId !== null) return false;
    if (team !== ALL_TEAMS && team !== NO_TEAM_FILTER && row.teamId !== team) return false;
    if (specialty !== null && row.specialty !== specialty) return false;
    if (!term) return true;
    return [row.name, row.specialty, row.teamName, row.email].some((value) => fold(value).includes(term));
  });
}
