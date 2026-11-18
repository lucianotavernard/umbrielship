import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderList } from '../work-order-list/work-order-list';
import { WorkOrder, WorkOrderStatus } from '../work-order.service';
import { answerWorkforce } from '../../../shared/testing/workforce';

// Fixtures and a page object for the specs of the "Ordens de serviço" page and its drawer.

/** A local wall-clock time as the API's ISO instant, so expectations hold in any timezone. */
export const local = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes).toISOString();

export const customers = [
  {
    id: 'c-atl',
    name: 'Pescados Atlântico',
    email: 'ops@atl.test',
    phone: '1',
    address: { address: 'Rua 1', city: 'Itajaí', state: 'SC' },
    vesselCount: 2,
  },
  {
    id: 'c-mar',
    name: 'Cooperativa Mar Azul',
    email: 'mar@azul.test',
    phone: '2',
    address: { address: 'Rua 2', city: 'Itajaí', state: 'SC' },
    vesselCount: 1,
  },
  {
    id: 'c-sul',
    name: 'Pesca Forte Ltda.',
    email: 'forte@sul.test',
    phone: '3',
    address: { address: 'Rua 3', city: 'Navegantes', state: 'SC' },
    vesselCount: 1,
  },
];

export const aurora = { id: 'v-aur', name: 'Aurora', imoNumber: '9182451', type: 'CARGO', length: 32.5, customerId: 'c-atl' };
export const lula = { id: 'v-lul', name: 'Lula Branca', imoNumber: '9236178', type: 'FISHING', length: 28, customerId: 'c-atl' };
export const vento = { id: 'v-ven', name: 'Vento Leste', imoNumber: '', type: 'TANKER', length: 26.4, customerId: 'c-mar' };
/** The Vessel of the generated WorkOrders. */
export const estrela = { id: 'v-est', name: 'Estrela do Sul', imoNumber: '', type: 'FISHING', length: 20, customerId: 'c-sul' };
/** Not by name: the drawer sorts them. */
export const vessels = [vento, estrela, aurora, lula];

const services = (orderId: string, names: string[], startDate: string, endDate: string) =>
  names.map((name, index) => ({
    id: `${orderId}-s${index + 1}`,
    name,
    startDate,
    endDate,
    status: 'PENDING' as const,
  }));

function order(
  id: string,
  vesselId: string,
  startDate: string,
  endDate: string,
  status: WorkOrderStatus,
  names: string[],
): WorkOrder {
  return { id, vesselId, startDate, endDate, status, services: services(id, names, startDate, endDate) };
}

/** #AB12CD34: Aurora, Docagem 17 nov 09:12, Desdocagem 20 nov 10:00, in progress, two services. */
export const orderA = order(
  'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-aur',
  local(2026, 11, 17, 9, 12),
  local(2026, 11, 20, 10, 0),
  'IN_PROGRESS',
  ['Motor', 'Pintura do casco'],
);
/** #EF90AB12: Lula Branca, ends tomorrow (18 nov) at 09:00, completed, no service. */
export const orderC = order(
  'ef90ab12-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-lul',
  local(2026, 11, 15, 7, 45),
  local(2026, 11, 18, 9, 0),
  'COMPLETED',
  [],
);
/** #AA000001: Vento Leste, the same Docagem as #CD56EF78, in progress. */
export const orderE = order(
  'aa000001-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-ven',
  local(2026, 11, 10, 8, 0),
  local(2026, 11, 12, 17, 0),
  'IN_PROGRESS',
  ['Pintura do convés'],
);
/** #CD56EF78: Vento Leste, ends today (17 nov) at 14:30, pending. */
export const orderB = order(
  'cd56ef78-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-ven',
  local(2026, 11, 10, 8, 0),
  local(2026, 11, 17, 14, 30),
  'PENDING',
  ['Revisão do motor'],
);
/** #12AB34CD: Aurora, October, cancelled, three services. */
export const orderD = order(
  '12ab34cd-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'v-aur',
  local(2026, 10, 12, 10, 0),
  local(2026, 10, 14, 16, 0),
  'CANCELLED',
  ['Casco', 'Hélice', 'Leme'],
);

/** As the API may send them: not in the page's order (A, C, E, B, D). */
export const fleet = [orderD, orderB, orderC, orderA, orderE];

/** `count` WorkOrders coded #00000001, #00000002…, Docagem one day apart, newest first. */
export function generated(count: number, status: (index: number) => WorkOrderStatus = () => 'PENDING'): WorkOrder[] {
  return Array.from({ length: count }, (_, at) => {
    const index = at + 1;
    const hex = index.toString(16).padStart(8, '0');
    return order(
      `${hex}-0000-4000-8000-000000000000`,
      'v-est',
      local(2026, 9, 30 - index, 8, 0),
      local(2026, 10, 1, 8, 0),
      status(index),
      ['Revisão'],
    );
  });
}

export const code = (index: number) => `#${index.toString(16).padStart(8, '0').toUpperCase()}`;

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

export async function click(target: Element | null | undefined) {
  if (!target) throw new Error('nothing to click');
  (target as HTMLElement).click();
  await settle();
}

export async function type(selector: string, value: string) {
  const field = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector);
  if (!field) throw new Error(selector);
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  await settle();
}

export const squash = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim();

export const buttonByText = (text: string, root: ParentNode = document) =>
  [...root.querySelectorAll<HTMLButtonElement>('button')].find((button) => squash(button.textContent) === text);

export const byLabel = <T extends HTMLElement = HTMLElement>(label: string, root: ParentNode = document) =>
  root.querySelector<T>(`[aria-label="${label}"]`);

export const drawer = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');

/** The "Ordens de serviço" page, rendered with the three reads answered. */
export class WorkOrderListPage {
  readonly fixture: ComponentFixture<WorkOrderList>;
  readonly element: HTMLElement;
  readonly controller = TestBed.inject(HttpTestingController);

  private constructor() {
    this.fixture = TestBed.createComponent(WorkOrderList);
    this.element = this.fixture.nativeElement as HTMLElement;
  }

  /** Creates the page and leaves its three requests unanswered. */
  static async pending() {
    const page = new WorkOrderListPage();
    await settle();
    return page;
  }

  static async open(workOrders: WorkOrder[] = fleet, vesselList: object[] = vessels, customerList: object[] = customers) {
    const page = await WorkOrderListPage.pending();
    const requests = page.reads();
    requests.workOrders.flush({ workOrders, total: workOrders.length });
    requests.vessels.flush({ vessels: vesselList, total: vesselList.length });
    requests.customers.flush({ customers: customerList, total: customerList.length });
    answerWorkforce(page.controller);
    await settle();
    return Object.assign(page, { requests });
  }

  reads(): { workOrders: TestRequest; vessels: TestRequest; customers: TestRequest } {
    return {
      workOrders: this.controller.expectOne('/api/work-orders'),
      vessels: this.controller.expectOne('/api/vessels'),
      customers: this.controller.expectOne('/api/customers'),
    };
  }

  /** Answers the list's reload after a write. */
  async reload(workOrders: WorkOrder[]) {
    const request = this.controller.expectOne((req) => req.method === 'GET' && req.urlWithParams === '/api/work-orders');
    request.flush({ workOrders, total: workOrders.length });
    await settle();
  }

  rows() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="work-order-row"]')];
  }

  /** The `#` code of each shown row, in order. */
  codes() {
    return this.rows().map((row) => squash(row.querySelector('[data-slot="code"]')?.textContent)?.split(' · ')[0]);
  }

  rowOf(code: string) {
    return this.rows().find((row) => squash(row.querySelector('[data-slot="code"]')?.textContent)?.startsWith(`${code} ·`));
  }

  metrics() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="metric"]')].map((metric) => [
      squash(metric.querySelector('div > span')?.textContent),
      squash(metric.querySelector('[data-slot="metric-value"]')?.textContent),
    ]);
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
    return this.element.querySelector<HTMLInputElement>('input[placeholder="Buscar ordem, embarcação ou cliente..."]')!;
  }

  async search(value: string) {
    const field = this.searchField();
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  }

  range() {
    return squash(this.element.querySelector('[data-slot="range"]')?.textContent);
  }

  pager() {
    return this.element.querySelector<HTMLElement>('nav[aria-label="Paginação"]');
  }

  /** The numbered page buttons. */
  pageButtons() {
    return [...(this.pager()?.querySelectorAll<HTMLButtonElement>('button') ?? [])].filter(
      (button) => !button.hasAttribute('aria-label'),
    );
  }

  currentPage() {
    return squash(this.pager()?.querySelector('[aria-current="page"]')?.textContent);
  }

  async goToPage(number: number) {
    await click(this.pageButtons().find((button) => squash(button.textContent) === String(number)));
  }

  exportButton() {
    return [...this.element.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Exportar'),
    )!;
  }

  empty() {
    return squash(this.element.querySelector('[data-slot="empty"]')?.textContent);
  }

  /** Opens "Ações para <code>" and returns its menu. */
  async openMenu(code: string) {
    const trigger = byLabel<HTMLButtonElement>(`Ações para ${code}`, this.element);
    await click(trigger);
    return trigger!.closest('t-dropdown-menu')!.querySelector<HTMLElement>('t-dropdown-menu-content')!;
  }
}
