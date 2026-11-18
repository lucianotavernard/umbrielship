import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  customers,
  local,
  settle,
  squash,
  vessels,
} from '../../../work-order/work-order/__test__/work-order-list.harness';
import { WorkOrder, WorkOrderServiceSummary, WorkOrderStatus } from '../../../work-order/work-order/work-order.service';
import { Assignment, Staff, TeamListItem } from '../../../workforce/staff/staff.service';
import { Dashboard } from '../dashboard/dashboard';

// Fixtures and a page object for the specs of "Visão geral". The page is read on Tuesday
// 17 November 2026 at noon, local time: "Esta semana" is Monday 16 to Sunday 22.

export { customers, vessels };

const service = (
  id: string,
  name: string,
  startDate: string,
  status: WorkOrderServiceSummary['status'] = 'PENDING',
  endDate = startDate,
) => ({ id, name, startDate, endDate, status });

function order(
  id: string,
  vesselId: string,
  startDate: string,
  endDate: string,
  status: WorkOrderStatus,
  services: ReturnType<typeof service>[] = [],
): WorkOrder {
  return { id, vesselId, startDate, endDate, status, services };
}

/** #AB12CD34: Aurora, Docagem Monday 08:00, Desdocagem Friday 17:00, in progress; Motor (Rafael) and Pintura do casco (Equipe Alfa). */
export const orderA = order(
  'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-aur',
  local(2026, 11, 16, 8, 0),
  local(2026, 11, 20, 17, 0),
  'IN_PROGRESS',
  [
    service('ab12cd34-s1', 'Motor', local(2026, 11, 17, 8, 30), 'IN_PROGRESS'),
    service('ab12cd34-s2', 'Pintura do casco', local(2026, 11, 18, 10, 30)),
  ],
);
/** #CD56EF78: Vento Leste, today 10:00 to 14:30, pending; Revisão do motor with no Responsável. */
export const orderB = order(
  'cd56ef78-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-ven',
  local(2026, 11, 17, 10, 0),
  local(2026, 11, 17, 14, 30),
  'PENDING',
  [service('cd56ef78-s1', 'Revisão do motor', local(2026, 11, 17, 10, 0))],
);
/** #EF90AB12: Lula Branca, completed on 12 November (this month), last week. */
export const orderC = order(
  'ef90ab12-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-lul',
  local(2026, 11, 10, 7, 45),
  local(2026, 11, 12, 9, 0),
  'COMPLETED',
);
/** #12AB34CD: Aurora, cancelled, Wednesday 09:00 to Thursday: nothing of it on the Agenda. */
export const orderD = order(
  '12ab34cd-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-aur',
  local(2026, 11, 18, 9, 0),
  local(2026, 11, 19, 16, 0),
  'CANCELLED',
  [service('12ab34cd-s1', 'Casco', local(2026, 11, 18, 9, 0))],
);
/** #AA000001: Vento Leste, in progress, Desdocagem tomorrow 09:00; Pintura do convés (Equipe Bravo) in progress. */
export const orderE = order(
  'aa000001-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-ven',
  local(2026, 11, 10, 8, 0),
  local(2026, 11, 18, 9, 0),
  'IN_PROGRESS',
  [service('aa000001-s1', 'Pintura do convés', local(2026, 11, 10, 8, 0), 'IN_PROGRESS')],
);
/** #BB000002: Estrela do Sul, completed on 31 October 23:59: not this month. */
export const orderF = order(
  'bb000002-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-est',
  local(2026, 10, 28, 8, 0),
  local(2026, 10, 31, 23, 59),
  'COMPLETED',
);

/** As the API may send them, in no particular order. */
export const fleet = [orderD, orderA, orderF, orderC, orderE, orderB];

export const alfa: TeamListItem = { id: 'alfa', name: 'Alfa', specialty: 'Motor', staffCount: 2 };
export const bravo: TeamListItem = { id: 'bravo', name: 'Bravo', specialty: 'Hidráulica', staffCount: 3 };
export const charlie: TeamListItem = { id: 'charlie', name: 'Charlie', specialty: 'Elétrica', staffCount: 2 };
/** Not by name: the panel sorts them. */
export const teams = [charlie, alfa, bravo];

const person = (id: string, name: string, teamId: string | null): Staff => ({
  id,
  name,
  specialty: 'Mecânico naval',
  email: `${id}@oficina.test`,
  phone: '47999990000',
  teamId,
});
export const rafael = person('rafael', 'Rafael Mendes', 'alfa');
/** Seven, not by name; the first two by name are Ana Souza and Beatriz Alves. */
export const staff = [
  rafael,
  person('joao', 'João Ferreira', 'bravo'),
  person('camila', 'Camila Rocha', 'bravo'),
  person('beatriz', 'Beatriz Alves', 'charlie'),
  person('pedro', 'Pedro Nascimento', null),
  person('ana', 'Ana Souza', 'alfa'),
  person('lucas', 'Lucas Lima', 'bravo'),
];

const assignment = (id: string, workOrderId: string, workOrderServiceId: string, who: { staffId?: string; teamId?: string }): Assignment => ({
  id,
  workOrderId,
  workOrderServiceId,
  staffId: who.staffId ?? null,
  teamId: who.teamId ?? null,
});
/** Motor: Rafael Mendes; Pintura do casco (pending): Equipe Alfa; Pintura do convés (in progress): Equipe Bravo. */
export const assignments = [
  assignment('a1', orderA.id, 'ab12cd34-s1', { staffId: 'rafael' }),
  assignment('a2', orderA.id, 'ab12cd34-s2', { teamId: 'alfa' }),
  assignment('a3', orderE.id, 'aa000001-s1', { teamId: 'bravo' }),
];

/** `count` WorkOrders coded #00000001, #00000002…, the same Desdocagem, so the code orders them. */
export function generated(count: number, status: (index: number) => WorkOrderStatus = () => 'PENDING'): WorkOrder[] {
  return Array.from({ length: count }, (_, at) => {
    const index = at + 1;
    const hex = index.toString(16).padStart(8, '0');
    return order(
      `${hex}-0000-4000-8000-000000000000`,
      'v-est',
      local(2026, 9, 1, 8, 0),
      local(2026, 12, 1, 8, 0),
      status(index),
      [service(`${hex}-s1`, 'Revisão', local(2026, 9, 1, 8, 0))],
    );
  });
}

export type Reads = {
  workOrders: TestRequest;
  vessels: TestRequest;
  customers: TestRequest;
  staff: TestRequest;
  teams: TestRequest;
  assignments: TestRequest;
};

export type Data = {
  workOrders?: WorkOrder[];
  vessels?: object[];
  customers?: object[];
  staff?: Staff[];
  teams?: TeamListItem[];
  assignments?: Assignment[];
};

/** "Visão geral", rendered with its six reads answered. */
export class DashboardPage {
  readonly fixture: ComponentFixture<Dashboard>;
  readonly element: HTMLElement;
  readonly controller = TestBed.inject(HttpTestingController);

  private constructor() {
    this.fixture = TestBed.createComponent(Dashboard);
    this.element = this.fixture.nativeElement as HTMLElement;
  }

  /** Creates the page and leaves its six requests unanswered. */
  static async pending() {
    const page = new DashboardPage();
    await settle();
    return page;
  }

  /** Answers the six reads with the fixtures above, or with what `data` gives instead. */
  static async open(data: Data = {}) {
    const page = await DashboardPage.pending();
    const requests = page.reads();
    page.answer(requests, { workOrders: fleet, vessels, customers, staff, teams, assignments, ...data });
    await settle();
    return Object.assign(page, { requests });
  }

  reads(): Reads {
    return {
      workOrders: this.controller.expectOne('/api/work-orders'),
      vessels: this.controller.expectOne('/api/vessels'),
      customers: this.controller.expectOne('/api/customers'),
      staff: this.controller.expectOne('/api/staff'),
      teams: this.controller.expectOne('/api/teams'),
      assignments: this.controller.expectOne('/api/assignments'),
    };
  }

  answer(requests: Partial<Reads>, data: Data) {
    if (data.workOrders) requests.workOrders?.flush({ workOrders: data.workOrders, total: data.workOrders.length });
    if (data.vessels) requests.vessels?.flush({ vessels: data.vessels, total: data.vessels.length });
    if (data.customers) requests.customers?.flush({ customers: data.customers, total: data.customers.length });
    if (data.staff) requests.staff?.flush({ staff: data.staff });
    if (data.teams) requests.teams?.flush({ teams: data.teams });
    if (data.assignments) requests.assignments?.flush({ assignments: data.assignments });
  }

  /** Answers the reloads a write asks for: the WorkOrders, and the Assignments when given. */
  async reload(workOrders: WorkOrder[], nextAssignments?: Assignment[]) {
    this.controller
      .expectOne((req) => req.method === 'GET' && req.urlWithParams === '/api/work-orders')
      .flush({ workOrders, total: workOrders.length });
    if (nextAssignments) {
      this.controller
        .expectOne((req) => req.method === 'GET' && req.urlWithParams === '/api/assignments')
        .flush({ assignments: nextAssignments });
    }
    await settle();
  }

  text(selector: string, root: ParentNode = this.element) {
    return squash(root.querySelector(selector)?.textContent);
  }

  texts(selector: string, root: ParentNode = this.element) {
    return [...root.querySelectorAll(selector)].map((element) => squash(element.textContent));
  }

  cards() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="stat-card"]')].map((card) => [
      this.text('[data-slot="stat-label"]', card),
      this.text('[data-slot="stat-value"]', card),
    ]);
  }

  notes() {
    return this.texts('[data-slot="stat-note"]');
  }

  agendaPanel() {
    return this.element.querySelector<HTMLElement>('[data-slot="agenda-panel"]')!;
  }

  periodButton() {
    return this.agendaPanel().querySelector<HTMLButtonElement>('button[data-slot="period"]')!;
  }

  agendaDays() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="agenda-day"]')].map((day) => [
      this.text('[data-slot="agenda-weekday"]', day),
      this.text('[data-slot="agenda-date"]', day),
    ]);
  }

  /** Each item as [time, Vessel, tag, line], in the order drawn. */
  agendaItems() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="agenda-item"]')].map((item) => [
      this.text('[data-slot="agenda-time"]', item),
      this.text('[data-slot="agenda-vessel"]', item),
      this.text('[data-slot="agenda-tag"]', item),
      this.text('[data-slot="agenda-line"]', item),
    ]);
  }

  /** Each Team as [name, line, status]. */
  teamRows() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="team-row"]')].map((row) => [
      this.text('[data-slot="team-name"]', row),
      this.text('[data-slot="team-line"]', row),
      this.text('[data-slot="team-status"]', row),
    ]);
  }

  footer() {
    return {
      label: this.text('[data-slot="team-footer-label"]'),
      initials: this.texts('[data-slot="team-footer-initials"]'),
      more: this.text('[data-slot="team-footer-more"]') ?? null,
    };
  }

  rows() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="work-order-row"]')];
  }

  /** The `#` code of each shown row, in order. */
  codes() {
    return this.rows().map((row) => this.text('[data-slot="code"]', row)?.split(' · ')[0]);
  }

  rowOf(code: string) {
    return this.rows().find((row) => this.text('[data-slot="code"]', row)?.startsWith(`${code} ·`));
  }

  tabs() {
    return [...this.element.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  }

  tab(label: string) {
    const tab = this.tabs().find((item) => squash(item.textContent)?.replace(/ \d+$/, '') === label);
    if (!tab) throw new Error(`no tab ${label}`);
    return tab;
  }

  selectedTabs() {
    return this.tabs()
      .filter((tab) => tab.getAttribute('aria-selected') === 'true')
      .map((tab) => squash(tab.textContent)?.replace(/ \d+$/, ''));
  }

  searchField() {
    return this.element.querySelector<HTMLInputElement>('input[placeholder="Buscar ordem..."]')!;
  }

  async search(value: string) {
    const field = this.searchField();
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  }

  range() {
    return this.text('[data-slot="range"]');
  }

  pager() {
    return this.element.querySelector<HTMLElement>('nav[aria-label="Paginação"]');
  }

  pageButtons() {
    return [...(this.pager()?.querySelectorAll<HTMLButtonElement>('button[data-slot="page"]') ?? [])];
  }

  currentPage() {
    return squash(this.pager()?.querySelector('[aria-current="page"]')?.textContent);
  }

  async goToPage(number: number) {
    const button = this.pageButtons().find((item) => squash(item.textContent) === String(number));
    if (!button) throw new Error(`no page ${number}`);
    button.click();
    await settle();
  }

  exportButton() {
    return [...this.element.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => squash(button.textContent) === 'Exportar',
    )!;
  }

  empty() {
    return this.text('[data-slot="empty"]');
  }

  /** Opens "Ações para <code>" and returns its menu. */
  async openMenu(code: string) {
    const trigger = this.element.querySelector<HTMLButtonElement>(`[aria-label="Ações para ${code}"]`);
    if (!trigger) throw new Error(`no menu for ${code}`);
    trigger.click();
    await settle();
    return trigger.closest('t-dropdown-menu')!.querySelector<HTMLElement>('t-dropdown-menu-content')!;
  }
}
