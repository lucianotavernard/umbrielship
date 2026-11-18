import { WorkOrder, workOrderCode } from '../work-order/work-order.service';

export type AgendaKind = 'SERVICE' | 'DOCKING' | 'UNDOCKING';

export const agendaKindLabels: Record<AgendaKind, string> = {
  SERVICE: 'Serviço',
  DOCKING: 'Docagem',
  UNDOCKING: 'Desdocagem',
};

/** One item of the Agenda: a service at its start, or a WorkOrder at its Docagem or Desdocagem (AD-036). */
export type AgendaItem = {
  key: string;
  workOrderId: string;
  /** The WorkOrderService of a `SERVICE` item; null for a Docagem or a Desdocagem. */
  serviceId: string | null;
  kind: AgendaKind;
  at: Date;
  time: string;
  vesselName: string;
  /** The service name, or "Docagem" / "Desdocagem". */
  title: string;
  code: string;
};

/** The grid rows: 2 hours each, 08:00 to 18:00. */
export const AGENDA_ROWS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const pad = (value: number) => String(value).padStart(2, '0');

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Monday to Sunday of the week holding `date`. */
export function weekDays(date: Date): Date[] {
  const monday = addDays(startOfDay(date), -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** The row of an hour: before 08:00 in "08:00", from 18:00 in "18:00". */
export function rowOf(date: Date): number {
  return Math.min(AGENDA_ROWS.length - 1, Math.max(0, Math.floor((date.getHours() - 8) / 2)));
}

export function weekdayLabel(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

/** "16 de nov": the mareos `shortDate`, two-digit day and short month. */
function shortDate(date: Date): string {
  return `${pad(date.getDate())} de ${MONTHS[date.getMonth()]}`;
}

/** "Novembro 2026" for a week in one month, "30 de nov — 06 de dez, 2026" across two (AD-049). */
export function weekLabel(days: Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
  }
  return `${shortDate(first)} — ${shortDate(last)}, ${last.getFullYear()}`;
}

/** "16 de nov — 22 de nov", "09 de nov — 15 de nov". */
export function rangeLabel(days: Date[]): string {
  return `${shortDate(days[0])} — ${shortDate(days[days.length - 1])}`;
}

/** "Quarta-feira, 18 de novembro". */
export function longDayLabel(date: Date): string {
  const text = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
}

/** "1 item", "3 itens" or "Livre". */
export function itemCountLabel(count: number): string {
  if (count === 0) return 'Livre';
  return count === 1 ? '1 item' : `${count} itens`;
}

/** Every item of the WorkOrders that are not `CANCELLED`, by time. */
export function agendaItems(workOrders: WorkOrder[], vesselNames: ReadonlyMap<string, string>): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const order of workOrders) {
    if (order.status === 'CANCELLED') continue;
    const vesselName = vesselNames.get(order.vesselId) ?? '';
    const code = workOrderCode(order.id);
    const item = (key: string, kind: AgendaKind, iso: string, title: string, serviceId: string | null = null): AgendaItem => {
      const at = new Date(iso);
      const time = `${pad(at.getHours())}:${pad(at.getMinutes())}`;
      return { key, workOrderId: order.id, serviceId, kind, at, time, vesselName, title, code };
    };
    items.push(item(`${order.id}:docking`, 'DOCKING', order.startDate, agendaKindLabels.DOCKING));
    items.push(item(`${order.id}:undocking`, 'UNDOCKING', order.endDate, agendaKindLabels.UNDOCKING));
    for (const service of order.services ?? []) {
      items.push(item(`${order.id}:${service.id}`, 'SERVICE', service.startDate, service.name, service.id));
    }
  }
  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
}

const fold = (text: string) => text.toLocaleLowerCase('pt-BR');

/** The items of `kind` (all for null) whose Vessel name, title or code contains `search`. */
export function filterAgenda(items: AgendaItem[], kind: AgendaKind | null, search: string): AgendaItem[] {
  const term = fold(search.trim()).replace(/^#/, '');
  return items.filter(
    (item) =>
      (kind === null || item.kind === kind) &&
      (!term || [item.vesselName, item.title, item.code.slice(1)].some((value) => fold(value).includes(term))),
  );
}

/** The items that fall on `days`. */
export function itemsOn(items: AgendaItem[], days: Date[]): AgendaItem[] {
  const keys = new Set(days.map(dateKey));
  return items.filter((item) => keys.has(dateKey(item.at)));
}
