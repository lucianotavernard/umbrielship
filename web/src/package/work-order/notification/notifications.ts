import type { Role } from '../../identity/user/user.service';
import { inspectionBlockedReason } from '../inspection-assignment/inspection-availability';
import type { OrganizationInspectionAssignment } from '../inspection-assignment/inspection-assignment.service';
import { WHOLE_WORK_ORDER } from '../inspection-assignment/inspection-assignment.service';
import { type WorkOrder, workOrderCode } from '../work-order/work-order.service';

/**
 * A notice of the top bar's bell (AD-116), derived in the browser from what the API answers: the
 * API keeps no notifications of its own.
 */
export type UserNotification = {
  /** Stable while the notice holds, so the browser can remember it was seen. */
  id: string;
  kind: 'overdue' | 'due-today' | 'inspection';
  title: string;
  detail: string;
  time: string;
  link: string[];
};

type Sources = {
  role: Role | null;
  workOrders: WorkOrder[];
  assignments: OrganizationInspectionAssignment[];
  vesselNames: Readonly<Record<string, string>>;
  now: Date;
};

const OPEN = new Set(['PENDING', 'IN_PROGRESS']);
const MINUTE = 60_000;

const twoDigits = (value: number) => String(value).padStart(2, '0');
const clock = (date: Date) => `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
const dayAndClock = (date: Date) =>
  `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}, ${clock(date)}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Há 5 min", "Há 3 h", "Há 2 dias": how long ago `then` was. */
export function timeAgo(then: Date, now: Date): string {
  const minutes = Math.max(1, Math.floor((now.getTime() - then.getTime()) / MINUTE));
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Há 1 dia' : `Há ${days} dias`;
}

/**
 * The notices of a Role (AD-116). An `administrator` or an `operator` hears of each open WorkOrder
 * past its deadline, most late first, then of each one due later today, soonest first. An
 * `inspector` hears of each inspection assignment ready to inspect and not inspected yet, newest
 * first.
 */
export function buildNotifications({ role, workOrders, assignments, vesselNames, now }: Sources): UserNotification[] {
  const vessel = (id: string) => vesselNames[id] ?? 'Embarcação';

  if (role === 'inspector') {
    return assignments
      .filter(
        (assignment) =>
          assignment.inspections.length === 0 &&
          inspectionBlockedReason(
            assignment.workOrder.status,
            assignment.service?.status,
            assignment.service !== null,
          ) === null,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((assignment) => ({
        id: `inspection:${assignment.id}`,
        kind: 'inspection' as const,
        title: `Inspeção liberada: ${assignment.templateName}`,
        detail: `${vessel(assignment.workOrder.vesselId)} · ${assignment.service?.name ?? WHOLE_WORK_ORDER}`,
        time: timeAgo(new Date(assignment.createdAt), now),
        link: ['/work-orders', assignment.workOrder.id, 'assignments', assignment.id, 'inspect'],
      }));
  }

  if (role !== 'administrator' && role !== 'operator') return [];

  const open = workOrders.filter((workOrder) => OPEN.has(workOrder.status));
  const due = (workOrder: WorkOrder) => new Date(workOrder.endDate);

  const overdue = open
    .filter((workOrder) => due(workOrder) < now)
    .sort((a, b) => due(a).getTime() - due(b).getTime())
    .map((workOrder) => ({
      id: `overdue:${workOrder.id}`,
      kind: 'overdue' as const,
      title: `Ordem ${workOrderCode(workOrder.id)} atrasada`,
      detail: `${vessel(workOrder.vesselId)} · prazo ${dayAndClock(due(workOrder))}`,
      time: timeAgo(due(workOrder), now),
      link: ['/work-orders', workOrder.id],
    }));

  const dueToday = open
    .filter((workOrder) => due(workOrder) >= now && sameDay(due(workOrder), now))
    .sort((a, b) => due(a).getTime() - due(b).getTime())
    .map((workOrder) => ({
      id: `due-today:${workOrder.id}`,
      kind: 'due-today' as const,
      title: `Ordem ${workOrderCode(workOrder.id)} vence hoje`,
      detail: `${vessel(workOrder.vesselId)} · até ${clock(due(workOrder))}`,
      time: 'Hoje',
      link: ['/work-orders', workOrder.id],
    }));

  return [...overdue, ...dueToday];
}
