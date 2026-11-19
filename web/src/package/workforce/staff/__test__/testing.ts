import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import type { WorkOrder } from '../../../work-order/work-order/work-order.service';
import { StaffList } from '../staff-list/staff-list';
import { Assignment, Staff, TeamListItem } from '../staff.service';

// Fixtures and a page object for the specs of "Equipe técnica".

export const alfa: TeamListItem = { id: 'alfa', name: 'Equipe Alfa', specialty: 'Motor', staffCount: 2 };
export const bravo: TeamListItem = { id: 'bravo', name: 'Equipe Bravo', specialty: 'Hidráulica', staffCount: 1 };
export const charlie: TeamListItem = { id: 'charlie', name: 'Equipe Charlie', specialty: 'Elétrica', staffCount: 0 };
/** Not by name: the page sorts them. */
export const teams = [bravo, charlie, alfa];

export const rafael: Staff = {
  id: 'rafael',
  name: 'Rafael Mendes',
  specialty: 'Mecânico naval',
  email: 'rafael.mendes@umbriel.test',
  phone: '(13) 99821-4401',
  teamId: 'alfa',
};
export const camila: Staff = {
  id: 'camila',
  name: 'Camila Rocha',
  specialty: 'Técnica elétrica',
  email: 'camila.rocha@umbriel.test',
  phone: '(13) 99712-3088',
  teamId: 'alfa',
};
export const joao: Staff = {
  id: 'joao',
  name: 'João Ferreira',
  specialty: 'Especialista hidráulico',
  email: 'joao.ferreira@umbriel.test',
  phone: '(13) 99640-1157',
  teamId: 'bravo',
};
export const pedro: Staff = {
  id: 'pedro',
  name: 'Pedro Nascimento',
  specialty: 'Mecânico naval',
  email: 'pedro.nascimento@umbriel.test',
  phone: '+55 (13) 99771-2083',
  teamId: null,
};
/** Not by name: the page sorts them. */
export const staff = [rafael, pedro, joao, camila];

const local = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes).toISOString();

/** #AB12CD34 on Aurora: "Motor" IN_PROGRESS (Equipe Alfa), "Pintura" PENDING (João). */
export const workOrders: WorkOrder[] = [
  {
    id: 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    vesselId: 'v-aur',
    startDate: local(2026, 11, 17, 9, 0),
    endDate: local(2026, 11, 20, 17, 0),
    status: 'IN_PROGRESS',
    services: [
      { id: 's-motor', name: 'Motor', startDate: local(2026, 11, 17, 9, 0), endDate: local(2026, 11, 18, 17, 0), status: 'IN_PROGRESS' },
      { id: 's-pintura', name: 'Pintura', startDate: local(2026, 11, 19, 8, 0), endDate: local(2026, 11, 20, 17, 0), status: 'PENDING' },
    ],
  },
];

export const assignments: Assignment[] = [
  { id: 'a1', workOrderId: workOrders[0].id, workOrderServiceId: 's-motor', staffId: null, teamId: 'alfa' },
  { id: 'a2', workOrderId: workOrders[0].id, workOrderServiceId: 's-pintura', staffId: 'joao', teamId: null },
];

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

export async function click(target: Element | null | undefined) {
  if (!target) throw new Error('nothing to click');
  (target as HTMLElement).click();
  await settle();
}

export async function type(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null, value: string) {
  if (!field) throw new Error('no field');
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
export const dialog = () => document.querySelector<HTMLElement>('[data-slot="dialog-content"]');

type Reads = { staff?: Staff[]; teams?: TeamListItem[]; assignments?: Assignment[]; workOrders?: WorkOrder[] };

/** The "Equipe técnica" page, with its four reads answered. */
export class StaffListPage {
  readonly fixture: ComponentFixture<StaffList>;
  readonly element: HTMLElement;
  readonly controller = TestBed.inject(HttpTestingController);

  private constructor() {
    this.fixture = TestBed.createComponent(StaffList);
    this.element = this.fixture.nativeElement as HTMLElement;
  }

  /** Creates the page as `role` and leaves its four requests unanswered. */
  static async pending(role: Role = 'administrator') {
    TestBed.inject(AuthenticationService).role.set(role);
    const page = new StaffListPage();
    await settle();
    return page;
  }

  static async open(role: Role = 'administrator', reads: Reads = {}) {
    const page = await StaffListPage.pending(role);
    await page.answer(reads);
    return page;
  }

  async answer({
    staff: staffList = staff,
    teams: teamList = teams,
    assignments: assignmentList = assignments,
    workOrders: workOrderList = workOrders,
  }: Reads = {}) {
    this.controller.expectOne('/api/staff').flush({ staff: staffList });
    this.controller.expectOne('/api/teams').flush({ teams: teamList });
    this.controller.expectOne('/api/assignments').flush({ assignments: assignmentList });
    this.controller.expectOne('/api/work-orders').flush({ workOrders: workOrderList, total: workOrderList.length });
    await settle();
  }

  /** Answers the reloads a write asks for. */
  async reload(urls: string[], reads: Reads = {}) {
    await settle();
    for (const url of urls) {
      const request = this.controller.expectOne((req) => req.method === 'GET' && req.url === url);
      if (url === '/api/staff') request.flush({ staff: reads.staff ?? staff });
      if (url === '/api/teams') request.flush({ teams: reads.teams ?? teams });
    }
    await settle();
  }

  rows() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="staff-row"]')];
  }

  names() {
    return this.rows().map((row) => squash(row.querySelector('[data-slot="staff-name"]')?.textContent));
  }

  column(slot: string) {
    return this.rows().map((row) => squash(row.querySelector(`[data-slot="${slot}"]`)?.textContent));
  }

  teamRows() {
    return [...this.element.querySelectorAll<HTMLElement>('[data-slot="team-row"]')].map((row) => [
      squash(row.querySelector('[data-slot="team-name"]')?.textContent),
      squash(row.querySelector('[data-slot="team-specialty"]')?.textContent),
      squash(row.querySelector('[data-slot="team-count"]')?.textContent),
      squash(row.querySelector('[data-slot="team-status"]')?.textContent),
    ]);
  }

  metrics() {
    return [...this.element.querySelectorAll('[data-slot="metric-value"]')].map((value) => squash(value.textContent));
  }

  range() {
    return squash(this.element.querySelector('[data-slot="list-footer"] [data-slot="range"]')?.textContent);
  }

  empty() {
    return squash(this.element.querySelector('[data-slot="empty"]')?.textContent);
  }

  chip(name: string) {
    return [...this.element.querySelectorAll<HTMLButtonElement>('[data-slot="specialty-chip"]')].find(
      (chip) => squash(chip.querySelector('span')?.textContent) === name,
    );
  }

  /** "Mecânico naval · 2": a chip's label and count. */
  chipText(name: string) {
    return [...(this.chip(name)?.querySelectorAll('span') ?? [])].map((span) => squash(span.textContent)).join(' · ');
  }

  async search(value: string) {
    await type(this.element.querySelector<HTMLInputElement>('input[placeholder="Buscar profissional..."]'), value);
  }

  async filterTeam(value: string) {
    await type(this.element.querySelector<HTMLSelectElement>('#team-filter'), value);
  }

  exportButton() {
    return [...this.element.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Exportar'),
    )!;
  }

  tab(name: string) {
    return [...this.element.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (tab) => squash(tab.textContent) === name,
    );
  }

  /** Opens "Ações para <nome>" and returns its menu. */
  async openMenu(name: string) {
    const trigger = byLabel<HTMLButtonElement>(`Ações para ${name}`, this.element);
    await click(trigger);
    return trigger!.closest('t-dropdown-menu')!.querySelector<HTMLElement>('t-dropdown-menu-content')!;
  }
}
