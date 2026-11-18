import { initials } from '../../shared/components/lib/initials';
import { twoDigits } from '../../shared/components/ui/metric';
import { AgendaItem, dateKey, itemsOn, startOfDay, weekDays, weekdayLabel } from '../../work-order/agenda/agenda-week';
import { StatusTab } from '../../work-order/work-order/work-order-filters';
import { WorkOrder, workOrderCode } from '../../work-order/work-order/work-order.service';
import { teamStatus, WorkforceStatus } from '../../workforce/staff/staff-status';
import { Assignment, Staff, TeamListItem } from '../../workforce/staff/staff.service';

// The rules of "Visão geral" (dashboard-redesign): what each card counts, which items, Teams and
// WorkOrders the panels show, and the greeting. The page only joins the reads and draws them.

export type Greeting = { text: 'Bom dia' | 'Boa tarde' | 'Boa noite'; icon: 'sun' | 'moon' };

/** "Bom dia" 05:00-11:59 and "Boa tarde" 12:00-17:59 with the sun, "Boa noite" 18:00-04:59 with a moon (AD-092). */
export function greeting(now: Date): Greeting {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: 'sun' };
  if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: 'sun' };
  return { text: 'Boa noite', icon: 'moon' };
}

/** The first word of the User's name: "Ana Maria Souza" -> "Ana". */
export function firstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}

/** "TERÇA-FEIRA, 17 DE NOVEMBRO DE 2026": today as `Intl` `pt-BR` writes it, upper-case. */
export function dateKicker(now: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(now)
    .toLocaleUpperCase('pt-BR');
}

/** The four cards, over every WorkOrder and never over a tab or a search (AD-088). */
export function dashboardCounts(orders: Pick<WorkOrder, 'status' | 'endDate'>[], now: Date) {
  const count = (keep: (order: Pick<WorkOrder, 'status' | 'endDate'>) => boolean) => orders.filter(keep).length;
  const thisMonth = (iso: string) => {
    const date = new Date(iso);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };
  return {
    open: twoDigits(count((order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS')),
    inProgress: twoDigits(count((order) => order.status === 'IN_PROGRESS')),
    pending: twoDigits(count((order) => order.status === 'PENDING')),
    completedThisMonth: twoDigits(count((order) => order.status === 'COMPLETED' && thisMonth(order.endDate))),
  };
}

/** How many Teams are "Em serviço" (AD-084). */
export function mobilizedTeams(
  teams: Pick<TeamListItem, 'id'>[],
  assignments: Assignment[],
  inProgress: ReadonlySet<string>,
): number {
  return teams.filter((team) => teamStatus(team.id, assignments, inProgress) === 'Em serviço').length;
}

/** "1 equipe mobilizada", "3 equipes mobilizadas". */
export function mobilizedLabel(count: number): string {
  return count === 1 ? '1 equipe mobilizada' : `${count} equipes mobilizadas`;
}

export type Period = 'WEEK' | 'TODAY';

export const periodLabels: Record<Period, string> = { WEEK: 'Esta semana', TODAY: 'Hoje' };

/** An Agenda item of the panel with the line beneath its Vessel. */
export type DashboardAgendaItem = AgendaItem & { line: string };

/** A day of the panel: "QUA" and "18", and its items by time. */
export type AgendaDay = { key: string; weekday: string; day: string; items: DashboardAgendaItem[] };

/**
 * The items of "Esta semana" (Monday to Sunday holding `now`) or "Hoje", grouped by day in order,
 * only the days that have items, each item with its line (AD-087, AD-089). `items` come sorted.
 */
export function periodItems(
  items: AgendaItem[],
  period: Period,
  now: Date,
  responsavelOfService: (serviceId: string) => string | null = () => null,
): AgendaDay[] {
  const days = period === 'WEEK' ? weekDays(now) : [startOfDay(now)];
  const byDay = new Map<string, AgendaDay>();
  for (const item of [...itemsOn(items, days)].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    const key = dateKey(item.at);
    let day = byDay.get(key);
    if (!day) {
      day = { key, weekday: weekdayLabel(item.at), day: String(item.at.getDate()), items: [] };
      byDay.set(key, day);
    }
    const responsavel = item.serviceId ? responsavelOfService(item.serviceId) : null;
    day.items.push({ ...item, line: agendaLine(item, responsavel) });
  }
  return [...byDay.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Beneath an item: "<serviço> · <responsável>", "<serviço> · <#code>" with none, and
 * "Docagem · <#code>" / "Desdocagem · <#code>" (AD-087).
 */
export function agendaLine(item: Pick<AgendaItem, 'kind' | 'title' | 'code'>, responsavel: string | null): string {
  if (item.kind === 'SERVICE' && responsavel) return `${item.title} · ${responsavel}`;
  return `${item.title} · ${item.code}`;
}

/** A Responsável as the dashboard writes it: the Staff's name or "Equipe <nome>", and its initials. */
export type Responsavel = { name: string; initials: string };

export function responsavelOfAssignment(
  assignment: Pick<Assignment, 'staffId' | 'teamId'> | undefined,
  staffNames: ReadonlyMap<string, string>,
  teamNames: ReadonlyMap<string, string>,
): Responsavel | null {
  const staffName = assignment?.staffId ? staffNames.get(assignment.staffId) : undefined;
  if (staffName) return { name: staffName, initials: initials(staffName) };
  const teamName = assignment?.teamId ? teamNames.get(assignment.teamId) : undefined;
  if (teamName) return { name: `Equipe ${teamName}`, initials: initials(teamName) };
  return null;
}

/** The Responsável of the WorkOrder's first service - the one "SERVIÇO" shows - or null (AD-086). */
export function responsavelOf(
  order: Pick<WorkOrder, 'services'>,
  byService: ReadonlyMap<string, Pick<Assignment, 'staffId' | 'teamId'>>,
  staffNames: ReadonlyMap<string, string>,
  teamNames: ReadonlyMap<string, string>,
): Responsavel | null {
  const first = order.services[0];
  if (!first) return null;
  return responsavelOfAssignment(byService.get(first.id), staffNames, teamNames);
}

/** A row of "Equipes em campo". `tone` picks one of the three symbol colours by position. */
export type TeamRow = { id: string; name: string; line: string; status: WorkforceStatus; tone: number };

/** "1 técnico", "2 técnicos". */
export function techniciansLabel(count: number): string {
  return count === 1 ? '1 técnico' : `${count} técnicos`;
}

/** Every Team by name in `pt-BR`, "<especialidade> · <n> técnicos" and its status (AD-084, AD-085). */
export function teamRows(teams: TeamListItem[], assignments: Assignment[], inProgress: ReadonlySet<string>): TeamRow[] {
  return [...teams]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((team, index) => ({
      id: team.id,
      name: team.name,
      line: `${team.specialty} · ${techniciansLabel(team.staffCount)}`,
      status: teamStatus(team.id, assignments, inProgress),
      tone: index % 3,
    }));
}

/** "<n> técnicos ativos" over every Staff, the initials of the first two by name and "+<n − 2>" (AD-092). */
export function teamFooter(staff: Pick<Staff, 'name'>[]) {
  const sorted = [...staff].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const count = sorted.length;
  return {
    label: count === 1 ? '1 técnico ativo' : `${count} técnicos ativos`,
    initials: sorted.slice(0, 2).map((item) => initials(item.name)),
    more: count > 2 ? `+${count - 2}` : null,
  };
}

/** The panel's tabs: every open WorkOrder, then by status (AD-090). */
export const DASHBOARD_TABS: { value: StatusTab; label: string }[] = [
  { value: 'ALL', label: 'Todas as ordens' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'PENDING', label: 'Pendentes' },
];

export const DASHBOARD_PAGE_SIZE = 5;

/** The WorkOrders `PENDING` or `IN_PROGRESS`, the nearest Desdocagem first, then the `#` code (AD-090). */
export function openOrders<T extends Pick<WorkOrder, 'id' | 'status' | 'endDate'>>(rows: T[]): T[] {
  return rows
    .filter((row) => row.status === 'PENDING' || row.status === 'IN_PROGRESS')
    .sort(
      (a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime() ||
        workOrderCode(a.id).localeCompare(workOrderCode(b.id)),
    );
}
