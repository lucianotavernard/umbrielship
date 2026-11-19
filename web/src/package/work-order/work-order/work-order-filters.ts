import { twoDigits } from '../../shared/components/ui/metric';
import { WorkOrder, workOrderCode, WorkOrderStatus } from './work-order.service';

/** A WorkOrder of the list with the names joined in the browser (AD-040). */
export type WorkOrderRow = WorkOrder & { vesselName: string; customerName: string };

export type StatusTab = 'ALL' | WorkOrderStatus;

export const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const fold = (text: string) => text.toLocaleLowerCase('pt-BR');

/** The four metrics, over every WorkOrder and never over a tab or a search. */
export function workOrderMetrics(list: Pick<WorkOrder, 'status'>[]) {
  const count = (status: WorkOrderStatus) => list.filter((order) => order.status === status).length;
  return {
    total: twoDigits(list.length),
    inProgress: twoDigits(count('IN_PROGRESS')),
    pending: twoDigits(count('PENDING')),
    completed: twoDigits(count('COMPLETED')),
  };
}

/** How many WorkOrders each tab holds, over every WorkOrder. */
export function tabCounts(list: Pick<WorkOrder, 'status'>[]): Record<StatusTab, number> {
  const counts: Record<StatusTab, number> = { ALL: list.length, PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const order of list) counts[order.status] += 1;
  return counts;
}

/** Docagem descending, then the `#` code. */
export function sortWorkOrders<T extends Pick<WorkOrder, 'id' | 'startDate'>>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime() ||
      workOrderCode(a.id).localeCompare(workOrderCode(b.id)),
  );
}

/**
 * The rows of `tab` whose code (with or without "#"), Vessel name, Customer name or a service name
 * contains `search`, case-insensitive.
 */
export function filterWorkOrders(rows: WorkOrderRow[], tab: StatusTab, search: string): WorkOrderRow[] {
  const term = fold(search.trim()).replace(/^#/, '');
  return rows.filter((row) => {
    if (tab !== 'ALL' && row.status !== tab) return false;
    if (!term) return true;
    const haystack = [
      workOrderCode(row.id).slice(1),
      row.vesselName,
      row.customerName,
      ...row.services.map((service) => service.name),
    ];
    return haystack.some((value) => fold(value).includes(term));
  });
}

// The pages of the WorkOrder list and of the dashboard come from the shared paging (AD-101).
export { pageCount, pageOf, rangeLabel } from '../../shared/components/lib/paging';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const pad = (value: number) => String(value).padStart(2, '0');
const time = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "17 nov, 09:12", in the browser's local time. */
export function shortDateTime(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]}, ${time(date)}`;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Hoje, 14:30", "Amanhã, 09:00" or "20 nov, 10:00", by the browser's local day. */
export function prazoLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (sameDay(date, now)) return `Hoje, ${time(date)}`;
  if (sameDay(date, tomorrow)) return `Amanhã, ${time(date)}`;
  return shortDateTime(iso);
}

/** "18 nov, 2026": the date a template card shows. */
export function shortDateWithYear(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/** "17/11/2026 09:12", in the browser's local time. */
export function numericDateTime(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${time(date)}`;
}

/** Beneath the first service: "+1 serviço", "+2 serviços", or nothing. */
export function moreServicesLabel(count: number): string {
  const more = count - 1;
  if (more <= 0) return '';
  return more === 1 ? '+1 serviço' : `+${more} serviços`;
}
