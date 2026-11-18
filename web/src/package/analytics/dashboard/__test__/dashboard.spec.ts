import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { toast } from '../../../shared/components/ui/toaster';
import {
  buttonByText,
  click,
  drawer,
  local,
  settle,
  squash,
  type,
} from '../../../work-order/work-order/__test__/work-order-list.harness';
import { WorkOrder } from '../../../work-order/work-order/work-order.service';
import {
  assignments,
  customers,
  DashboardPage,
  fleet,
  generated,
  orderA,
  orderB,
  orderC,
  orderD,
  orderE,
  orderF,
  Reads,
  staff,
  teams,
  vessels,
} from './dashboard.harness';

@Component({ template: 'page' })
class Stub {}

const code = (index: number) => `#${index.toString(16).padStart(8, '0').toUpperCase()}`;
const codes = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, at) => code(from + at));

/** The cards as the fleet draws them on Tuesday 17 November: A, B and E open, C completed this month. */
const FLEET_CARDS = [
  ['Ordens em aberto', '03'],
  ['Em execução', '02'],
  ['Pendentes', '01'],
  ['Concluídas no mês', '01'],
];

/** The Agenda of the week of Monday 16 November, as the fleet draws it. */
const WEEK_ITEMS = [
  ['08:00', 'Aurora', 'Docagem', 'Docagem · #AB12CD34'],
  ['08:30', 'Aurora', 'Serviço', 'Motor · Rafael Mendes'],
  ['10:00', 'Vento Leste', 'Docagem', 'Docagem · #CD56EF78'],
  ['10:00', 'Vento Leste', 'Serviço', 'Revisão do motor · #CD56EF78'],
  ['14:30', 'Vento Leste', 'Desdocagem', 'Desdocagem · #CD56EF78'],
  ['09:00', 'Vento Leste', 'Desdocagem', 'Desdocagem · #AA000001'],
  ['10:30', 'Aurora', 'Serviço', 'Pintura do casco · Equipe Alfa'],
  ['17:00', 'Aurora', 'Desdocagem', 'Desdocagem · #AB12CD34'],
];

describe('Dashboard', () => {
  let controller: HttpTestingController;
  const authentication = () => TestBed.inject(AuthenticationService);

  beforeEach(() => {
    // The page is read on Tuesday 17 November 2026 at noon, local time.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'work-orders/:id', component: Stub },
          { path: 'agenda', component: Stub },
          { path: 'staff', component: Stub },
        ]),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    authentication().role.set('operator');
    authentication().name.set('Ana Maria Souza');
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Every request still open, as "METHOD url" (match() takes them). */
  const sent = () => controller.match(() => true).map((request) => `${request.request.method} ${request.request.urlWithParams}`);

  async function as(role: Role) {
    authentication().role.set(role);
  }

  it('dashboard C1 requests the six reads once with no paging for every role', async () => {
    for (const role of ['administrator', 'operator', 'inspector'] as const) {
      await as(role);
      const page = await DashboardPage.open();

      for (const [url, request] of [
        ['/api/work-orders', page.requests.workOrders],
        ['/api/vessels', page.requests.vessels],
        ['/api/customers', page.requests.customers],
        ['/api/staff', page.requests.staff],
        ['/api/teams', page.requests.teams],
        ['/api/assignments', page.requests.assignments],
      ] as const) {
        expect(request.request.method, `${role} ${url}`).toBe('GET');
        expect(request.request.urlWithParams, role).toBe(url);
        expect(request.request.params.keys(), `${role} ${url}`).toEqual([]);
      }
      // Nothing else was asked: no second page, no per-vessel read.
      expect(sent(), role).toEqual([]);
      expect(page.rows().length, role).toBe(3);
      expect(page.element.textContent, role).not.toContain('Total de Clientes');
      page.fixture.destroy();
    }
  });

  it('dashboard C2 opens with the date, the greeting and the subtitle', async () => {
    const greetingOf = (page: DashboardPage) => ({
      kicker: page.text('[data-slot="kicker"]'),
      heading: page.text('[data-slot="greeting"]'),
      icon: page.element.querySelector('[data-slot="greeting"] [data-slot="greeting-icon"]')?.getAttribute('data-icon'),
    });

    let page = await DashboardPage.open();
    expect(greetingOf(page)).toEqual({ kicker: 'TERÇA-FEIRA, 17 DE NOVEMBRO DE 2026', heading: 'Boa tarde, Ana', icon: 'sun' });
    expect(page.element.querySelector('h1 + p')?.textContent?.trim()).toBe(
      'Aqui está o resumo da operação da sua oficina hoje.',
    );
    page.fixture.destroy();

    vi.setSystemTime(new Date(2026, 10, 17, 8, 0));
    page = await DashboardPage.open();
    expect(greetingOf(page)).toEqual({ kicker: 'TERÇA-FEIRA, 17 DE NOVEMBRO DE 2026', heading: 'Bom dia, Ana', icon: 'sun' });
    page.fixture.destroy();

    vi.setSystemTime(new Date(2026, 10, 18, 19, 30));
    page = await DashboardPage.open();
    expect(greetingOf(page)).toEqual({ kicker: 'QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026', heading: 'Boa noite, Ana', icon: 'moon' });
  });

  it('dashboard C3 shows the four cards over every work order whatever the tab or search', async () => {
    const page = await DashboardPage.open();

    expect(page.element.querySelector('section[aria-label="Indicadores da operação"]')).not.toBeNull();
    expect(page.cards()).toEqual(FLEET_CARDS);

    await click(page.tab('Pendentes'));
    await page.search('zzz');
    expect(page.rows().length).toBe(0);
    expect(page.cards()).toEqual(FLEET_CARDS);
    page.fixture.destroy();

    const empty = await DashboardPage.open({ workOrders: [] });
    expect(empty.cards()).toEqual([
      ['Ordens em aberto', '00'],
      ['Em execução', '00'],
      ['Pendentes', '00'],
      ['Concluídas no mês', '00'],
    ]);
  });

  it('dashboard C4 notes the mobilised teams under em execução and no trend', async () => {
    const page = await DashboardPage.open();
    const section = page.element.querySelector<HTMLElement>('section[aria-label="Indicadores da operação"]')!;

    // Bravo is on a service in progress; Alfa only on a pending one.
    expect(page.notes()).toEqual(['1 equipe mobilizada']);
    const noted = section.querySelector('[data-slot="stat-note"]')!.closest('[data-slot="stat-card"]')!;
    expect(page.text('[data-slot="stat-label"]', noted)).toBe('Em execução');
    for (const text of ['vs.', 'desde ontem', 'prioridade', 'entregas previstas', 'no prazo', '%']) {
      expect(section.textContent, text).not.toContain(text);
    }
    page.fixture.destroy();

    const none = await DashboardPage.open({ assignments: assignments.filter((item) => item.teamId !== 'bravo') });
    expect(none.notes()).toEqual(['0 equipes mobilizadas']);
  });

  it('dashboard C5 draws each day and item of the agenda panel', async () => {
    const page = await DashboardPage.open();
    const panel = page.agendaPanel();

    expect(page.text('h2', panel)).toBe('Agenda de serviços');
    expect(page.text('h2 + p', panel)).toBe('O que está acontecendo na oficina');
    // Only the days with items; the cancelled #12AB34CD and last week's #EF90AB12 draw nothing.
    expect(page.agendaDays()).toEqual([
      ['SEG', '16'],
      ['TER', '17'],
      ['QUA', '18'],
      ['SEX', '20'],
    ]);
    expect(page.agendaItems()).toEqual(WEEK_ITEMS);
    const perDay = [...panel.querySelectorAll('[data-slot="agenda-day"]')].map(
      (day) => day.querySelectorAll('[data-slot="agenda-item"]').length,
    );
    expect(perDay).toEqual([1, 4, 2, 1]);
  });

  it('dashboard C6 alternates esta semana and hoje', async () => {
    const page = await DashboardPage.open();

    expect(page.text('button[data-slot="period"]', page.agendaPanel())).toBe('Esta semana');
    await click(page.periodButton());
    expect(page.text('button[data-slot="period"]', page.agendaPanel())).toBe('Hoje');
    expect(page.agendaDays()).toEqual([['TER', '17']]);
    expect(page.agendaItems()).toEqual(WEEK_ITEMS.slice(1, 5));

    await click(page.periodButton());
    expect(page.text('button[data-slot="period"]', page.agendaPanel())).toBe('Esta semana');
    expect(page.agendaItems()).toEqual(WEEK_ITEMS);
    // The period never asks the API.
    expect(sent()).toEqual([]);
  });

  it('dashboard C7 tells an empty today from an empty week', async () => {
    let page = await DashboardPage.open({ workOrders: [orderC, orderD] });
    const empty = () => page.text('[data-slot="agenda-empty"]');

    expect(page.agendaItems()).toEqual([]);
    expect(empty()).toBe('Nenhum item na agenda nesta semana.');
    await click(page.periodButton());
    expect(empty()).toBe('Nenhum item na agenda hoje.');
    page.fixture.destroy();

    // Items on Monday only: the week has them, today has none.
    const monday: WorkOrder = { ...orderA, startDate: local(2026, 11, 16, 8, 0), endDate: local(2026, 11, 16, 17, 0), services: [] };
    page = await DashboardPage.open({ workOrders: [monday] });
    expect(page.agendaItems().length).toBe(2);
    expect(empty()).toBeUndefined();
    await click(page.periodButton());
    expect(page.agendaItems()).toEqual([]);
    expect(empty()).toBe('Nenhum item na agenda hoje.');
    // The list scrolls inside the panel at a fixed height.
    const list = page.agendaPanel().querySelector('[data-slot="agenda-list"]')!;
    expect(list.classList).toContain('overflow-y-auto');
    expect([...list.classList].some((token) => /^h-\[\d+px\]$/.test(token))).toBe(true);
  });

  it('dashboard C8 opens the work order of an agenda item', async () => {
    const page = await DashboardPage.open();
    const router = TestBed.inject(Router);

    expect(page.agendaPanel().querySelector('[aria-label="Mais opções"]')).toBeNull();
    const items = [...page.element.querySelectorAll<HTMLAnchorElement>('a[data-slot="agenda-item"]')];
    expect(items.map((item) => item.getAttribute('href'))).toEqual([
      `/work-orders/${orderA.id}`,
      `/work-orders/${orderA.id}`,
      `/work-orders/${orderB.id}`,
      `/work-orders/${orderB.id}`,
      `/work-orders/${orderB.id}`,
      `/work-orders/${orderE.id}`,
      `/work-orders/${orderA.id}`,
      `/work-orders/${orderA.id}`,
    ]);

    await click(items[2]);
    expect(router.url).toBe(`/work-orders/${orderB.id}`);
  });

  it('dashboard C9 opens the agenda from ver agenda completa', async () => {
    const page = await DashboardPage.open();
    const router = TestBed.inject(Router);
    const link = [...page.agendaPanel().querySelectorAll<HTMLAnchorElement>('a')].find(
      (anchor) => squash(anchor.textContent) === 'Ver agenda completa',
    )!;

    expect(link.getAttribute('href')).toBe('/agenda');
    await click(link);
    expect(router.url).toBe('/agenda');
  });

  it('dashboard C10 shows each team of the organization in equipes em campo', async () => {
    const page = await DashboardPage.open();
    const panel = page.element.querySelector<HTMLElement>('[data-slot="teams-panel"]')!;

    expect(page.text('h2', panel)).toBe('Equipes em campo');
    expect(page.text('h2 + p', panel)).toBe('Disponibilidade das equipes');
    expect(page.teamRows()).toEqual([
      ['Equipe Alfa', 'Motor · 2 técnicos', 'Disponível'],
      ['Equipe Bravo', 'Hidráulica · 3 técnicos', 'Em serviço'],
      ['Equipe Charlie', 'Elétrica · 2 técnicos', 'Disponível'],
    ]);
    const list = panel.querySelector('[data-slot="team-list"]')!;
    expect(list.classList).toContain('overflow-y-auto');
  });

  it('dashboard C11 shows the technicians footer', async () => {
    const page = await DashboardPage.open();

    expect(page.footer()).toEqual({ label: '7 técnicos ativos', initials: ['AS', 'BA'], more: '+5' });
  });

  it('dashboard C12 says when there is no team', async () => {
    const page = await DashboardPage.open({ teams: [] });

    expect(page.teamRows()).toEqual([]);
    expect(page.text('[data-slot="teams-empty"]')).toBe('Ainda não há equipes cadastradas.');
    // The footer still counts every professional.
    expect(page.footer().label).toBe('7 técnicos ativos');
  });

  it('dashboard C13 opens the equipes tab from mais opções', async () => {
    const page = await DashboardPage.open();
    const router = TestBed.inject(Router);
    const more = page.element.querySelector<HTMLAnchorElement>('[data-slot="teams-panel"] a[aria-label="Mais opções"]')!;

    expect(more.getAttribute('href')).toBe('/staff?tab=equipes');
    await click(more);
    expect(router.url).toBe('/staff?tab=equipes');
  });

  it('dashboard C14 pages the open orders by 5 within each tab', async () => {
    // 1-3 pending, 4-7 in progress, 8 completed, 9 cancelled; one Desdocagem, so the code orders them.
    const status = (index: number) => (index <= 3 ? 'PENDING' : index <= 7 ? 'IN_PROGRESS' : index === 8 ? 'COMPLETED' : 'CANCELLED');
    let page = await DashboardPage.open({ workOrders: generated(9, status) });

    expect(page.tabs().map((tab) => squash(tab.textContent))).toEqual(['Todas as ordens 7', 'Em andamento', 'Pendentes']);
    expect(page.selectedTabs()).toEqual(['Todas as ordens']);
    expect(page.codes()).toEqual(codes(1, 5));
    expect(page.range()).toBe('Exibindo 1–5 de 7 ordens');
    expect(page.pageButtons().map((button) => squash(button.textContent))).toEqual(['1', '2']);

    await page.goToPage(2);
    expect(page.currentPage()).toBe('2');
    expect(page.codes()).toEqual(codes(6, 7));
    expect(page.range()).toBe('Exibindo 6–7 de 7 ordens');

    await click(page.tab('Pendentes'));
    expect(page.selectedTabs()).toEqual(['Pendentes']);
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(codes(1, 3));
    expect(page.range()).toBe('Exibindo 1–3 de 3 ordens');

    await click(page.tab('Em andamento'));
    expect(page.codes()).toEqual(codes(4, 7));
    expect(page.range()).toBe('Exibindo 1–4 de 4 ordens');
    // The count stays on every open WorkOrder.
    expect(squash(page.tab('Todas as ordens').textContent)).toBe('Todas as ordens 7');
    expect(page.element.textContent).not.toContain(code(8));
    expect(page.element.textContent).not.toContain(code(9));
    page.fixture.destroy();

    // The nearest Desdocagem first: today 14:30, tomorrow 09:00, Friday 17:00.
    page = await DashboardPage.open();
    expect(page.codes()).toEqual(['#CD56EF78', '#AA000001', '#AB12CD34']);
  });

  it('dashboard C15 searches within the tab and goes back to page 1', async () => {
    const page = await DashboardPage.open({ workOrders: [...fleet, ...generated(7)] });

    expect(page.searchField().getAttribute('aria-label')).toBe('Buscar ordens');
    await page.goToPage(2);
    await page.search('aurora');
    expect(page.currentPage()).toBe('1');
    // #12AB34CD is Aurora's too, and cancelled.
    expect(page.codes()).toEqual(['#AB12CD34']);

    await page.search('#ab12');
    expect(page.codes()).toEqual(['#AB12CD34']);
    await page.search('AB12');
    expect(page.codes()).toEqual(['#AB12CD34']);
    await page.search('pintura');
    expect(page.codes()).toEqual(['#AA000001', '#AB12CD34']);
    await page.search('MAR AZUL');
    expect(page.codes()).toEqual(['#CD56EF78', '#AA000001']);

    await page.search('zzz');
    expect(page.rows().length).toBe(0);
    expect(page.empty()).toBe('Nenhuma ordem encontrada.');

    // Within the tab: both "pintura" WorkOrders are in progress.
    await page.search('pintura');
    await click(page.tab('Pendentes'));
    expect(page.rows().length).toBe(0);
    expect(page.empty()).toBe('Nenhuma ordem encontrada.');

    // A tab goes back to page 1.
    await page.search('');
    await click(page.tab('Todas as ordens'));
    await page.goToPage(2);
    expect(page.currentPage()).toBe('2');
    await click(page.tab('Em andamento'));
    expect(page.currentPage()).toBe('1');

    // The search never asks the API.
    expect(sent()).toEqual([]);
  });

  it('dashboard C16 shows vessel, code, service, responsável, prazo and status in each row', async () => {
    const view = (page: DashboardPage) =>
      page.rows().map((row) => ({
        avatar: row.querySelectorAll('span[aria-hidden="true"].bg-\\[\\#e9f3f3\\]').length,
        vessel: page.text('a[data-slot="vessel"]', row),
        code: page.text('[data-slot="code"]', row),
        service: page.text('[data-slot="service"]', row),
        more: page.text('[data-slot="more-services"]', row) ?? null,
        initials: page.text('[data-slot="responsavel-initials"]', row) ?? null,
        responsavel: page.text('[data-slot="responsavel-name"]', row) ?? page.text('[data-slot="responsavel"]', row),
        prazo: page.text('[data-slot="prazo"]', row),
        status: page.text('[data-slot="status"]', row),
      }));

    let page = await DashboardPage.open();
    expect(page.texts('thead th')).toEqual(['EMBARCAÇÃO', 'SERVIÇO', 'RESPONSÁVEL', 'PRAZO', 'STATUS', 'Ações']);
    expect(view(page)).toEqual([
      {
        avatar: 1,
        vessel: 'Vento Leste',
        code: '#CD56EF78 · Cooperativa Mar Azul',
        service: 'Revisão do motor',
        more: null,
        initials: null,
        responsavel: 'Sem responsável',
        prazo: 'Hoje, 14:30',
        status: 'Pendente',
      },
      {
        avatar: 1,
        vessel: 'Vento Leste',
        code: '#AA000001 · Cooperativa Mar Azul',
        service: 'Pintura do convés',
        more: null,
        initials: 'B',
        responsavel: 'Equipe Bravo',
        prazo: 'Amanhã, 09:00',
        status: 'Em andamento',
      },
      {
        avatar: 1,
        vessel: 'Aurora',
        code: '#AB12CD34 · Pescados Atlântico',
        service: 'Motor',
        more: '+1 serviço',
        initials: 'RM',
        responsavel: 'Rafael Mendes',
        prazo: '20 nov, 17:00',
        status: 'Em andamento',
      },
    ]);
    page.fixture.destroy();

    // Only the second service has a Responsável; and a WorkOrder with no service.
    const second = assignments.filter((item) => item.id === 'a2');
    const bare: WorkOrder = { ...orderB, services: [] };
    page = await DashboardPage.open({ workOrders: [orderA, bare], assignments: second });
    expect(view(page).map((row) => [row.service, row.responsavel, row.initials])).toEqual([
      ['Nenhum serviço', 'Sem responsável', null],
      ['Motor', 'Sem responsável', null],
    ]);
  });

  it('dashboard C17 offers ver detalhes to every role and editar and excluir to writers', async () => {
    for (const role of ['operator', 'administrator'] as const) {
      await as(role);
      const page = await DashboardPage.open();
      const menu = await page.openMenu('#AB12CD34');

      expect(page.texts('a, button', menu), role).toEqual(['Ver detalhes', 'Editar', 'Excluir']);
      const details = [...menu.querySelectorAll('a')].find((link) => squash(link.textContent) === 'Ver detalhes')!;
      expect(details.getAttribute('href'), role).toBe(`/work-orders/${orderA.id}`);
      await click(details);
      expect(TestBed.inject(Router).url, role).toBe(`/work-orders/${orderA.id}`);
      page.fixture.destroy();
    }
  });

  it('dashboard C18 edits from the row menu and shows the new values', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await DashboardPage.open();

    await click(buttonByText('Editar', await page.openMenu('#CD56EF78')));
    const sheet = drawer()!;
    expect(squash(sheet.querySelector('[data-slot="sheet-title"]')?.textContent)).toBe('Editar ordem de serviço');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.value).toBe('v-ven');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.disabled).toBe(true);
    expect(sheet.querySelector<HTMLInputElement>('#wo-end')!.value).toBe('2026-11-17T14:30');
    // An operator names no Responsável.
    expect(sheet.textContent).not.toContain('Serviços a realizar');

    await type('#wo-end', '2026-11-19T18:00');
    await type('#wo-status', 'IN_PROGRESS');
    await click(buttonByText('Salvar alterações', drawer()!));

    const put = controller.expectOne(`/api/work-orders/${orderB.id}`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 10, 0),
      endDate: local(2026, 11, 19, 18, 0),
      status: 'IN_PROGRESS',
    });
    put.flush(null);
    await settle();
    const edited = { ...orderB, endDate: local(2026, 11, 19, 18, 0), status: 'IN_PROGRESS' as const };
    await page.reload(fleet.map((order) => (order.id === orderB.id ? edited : order)));

    expect(success).toHaveBeenCalledWith('Ordem atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(page.cards()).toEqual([
      ['Ordens em aberto', '03'],
      ['Em execução', '03'],
      ['Pendentes', '00'],
      ['Concluídas no mês', '01'],
    ]);
    expect(page.codes()).toEqual(['#AA000001', '#CD56EF78', '#AB12CD34']);
    const row = page.rowOf('#CD56EF78')!;
    expect(page.text('[data-slot="status"]', row)).toBe('Em andamento');
    expect(page.text('[data-slot="prazo"]', row)).toBe('19 nov, 18:00');
    expect(page.agendaDays()).toEqual([
      ['SEG', '16'],
      ['TER', '17'],
      ['QUA', '18'],
      ['QUI', '19'],
      ['SEX', '20'],
    ]);
    expect(page.agendaItems()).toContainEqual(['18:00', 'Vento Leste', 'Desdocagem', 'Desdocagem · #CD56EF78']);
    expect(page.agendaItems()).not.toContainEqual(['14:30', 'Vento Leste', 'Desdocagem', 'Desdocagem · #CD56EF78']);
  });

  it("dashboard C18 an administrator's responsável refreshes the row, the team and the note", async () => {
    await as('administrator');
    // Rafael on Motor (in progress) and Alfa on Pintura do casco (pending): no Team in service.
    const before = assignments.filter((item) => item.id !== 'a3');
    const page = await DashboardPage.open({ assignments: before });
    expect(page.notes()).toEqual(['0 equipes mobilizadas']);
    expect(page.teamRows()[0]).toEqual(['Equipe Alfa', 'Motor · 2 técnicos', 'Disponível']);

    await click(buttonByText('Editar', await page.openMenu('#AB12CD34')));
    const select = (id: string) => drawer()!.querySelector<HTMLSelectElement>(id)!;
    expect(select('#wo-existing-assignee-0').value).toBe('staff:rafael');
    expect(select('#wo-existing-assignee-1').value).toBe('team:alfa');

    await type('#wo-existing-assignee-0', 'team:alfa');
    await click(buttonByText('Salvar alterações', drawer()!));
    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === `/api/work-orders/${orderA.id}`);
    expect(put.request.body.services).toEqual([
      { id: 'ab12cd34-s1', teamId: 'alfa' },
      { id: 'ab12cd34-s2', teamId: 'alfa' },
    ]);
    put.flush(null);
    await settle();
    const after = [{ ...before[0], staffId: null, teamId: 'alfa' }, before[1]];
    await page.reload(fleet, after);

    const row = page.rowOf('#AB12CD34')!;
    expect(page.text('[data-slot="responsavel-name"]', row)).toBe('Equipe Alfa');
    expect(page.text('[data-slot="responsavel-initials"]', row)).toBe('A');
    expect(page.teamRows()[0]).toEqual(['Equipe Alfa', 'Motor · 2 técnicos', 'Em serviço']);
    expect(page.notes()).toEqual(['1 equipe mobilizada']);
    expect(page.agendaItems()).toContainEqual(['08:30', 'Aurora', 'Serviço', 'Motor · Equipe Alfa']);
  });

  it('dashboard C18 an edit opened before the workforce reads answer sends no responsável', async () => {
    await as('administrator');
    const page = await DashboardPage.pending();
    const requests = page.reads();
    page.answer(requests, { workOrders: fleet, vessels, customers });
    await settle();

    // Until the Staff, Teams and Assignments answer there is no row, so no edit to open.
    expect(page.rows()).toEqual([]);
    expect(page.element.querySelector('[aria-label^="Ações para"]')).toBeNull();
    expect(page.element.textContent).not.toContain('Sem responsável');

    page.answer(requests, { staff, teams, assignments });
    await settle();

    // Opened now, the drawer holds the stored Responsáveis, and saving keeps them.
    await click(buttonByText('Editar', await page.openMenu('#AB12CD34')));
    await click(buttonByText('Salvar alterações', drawer()!));
    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === `/api/work-orders/${orderA.id}`);
    expect(put.request.body.services).toEqual([
      { id: 'ab12cd34-s1', staffId: 'rafael' },
      { id: 'ab12cd34-s2', teamId: 'alfa' },
    ]);
    put.flush(null);
    await settle();
    await page.reload(fleet, assignments);
  });

  it('dashboard C19 deletes after the confirmation and drops the order and its assignments', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await DashboardPage.open();
    expect(page.teamRows()[1]).toEqual(['Equipe Bravo', 'Hidráulica · 3 técnicos', 'Em serviço']);

    await click(buttonByText('Excluir', await page.openMenu('#AA000001')));
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.',
    );
    controller.expectNone(`/api/work-orders/${orderE.id}`);

    await click(buttonByText('Confirmar', confirmation));
    const deletion = controller.expectOne(`/api/work-orders/${orderE.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    // The WorkOrder and its Assignments are read again.
    await page.reload(
      fleet.filter((order) => order.id !== orderE.id),
      assignments.filter((item) => item.workOrderId !== orderE.id),
    );

    expect(success).toHaveBeenCalledWith('Ordem de serviço excluída com sucesso', expect.anything());
    expect(page.codes()).toEqual(['#CD56EF78', '#AB12CD34']);
    expect(page.cards()).toEqual([
      ['Ordens em aberto', '02'],
      ['Em execução', '01'],
      ['Pendentes', '01'],
      ['Concluídas no mês', '01'],
    ]);
    expect(page.agendaItems()).not.toContainEqual(['09:00', 'Vento Leste', 'Desdocagem', 'Desdocagem · #AA000001']);
    expect(page.teamRows()[1]).toEqual(['Equipe Bravo', 'Hidráulica · 3 técnicos', 'Disponível']);
    expect(page.notes()).toEqual(['0 equipes mobilizadas']);
  });

  it('dashboard C20 exports the rows of the tab and search on every page', async () => {
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((value: Blob) => {
      blob = value;
      return 'blob:dashboard';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
    const lines = async () =>
      new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob!.arrayBuffer()).split('\r\n');

    try {
      // Three pending - Vento Leste, Aurora and Estrela do Sul - and two in progress.
      const auroraPending: WorkOrder = { ...orderD, id: 'cc000003-5e6f-4a7b-8c9d-0e1f2a3b4c5d', status: 'PENDING' };
      let page = await DashboardPage.open({ workOrders: [...fleet, auroraPending, ...generated(1)] });

      await click(page.tab('Pendentes'));
      expect(page.codes()).toEqual(['#CD56EF78', '#CC000003', code(1)]);
      await page.search('aurora');
      await click(page.exportButton());
      expect(downloads).toEqual(['ordens-de-servico.csv']);
      expect(await lines()).toEqual([
        '﻿"OS","Embarcação","Cliente","Serviço","Docagem","Desdocagem","Status"',
        '"#CC000003","Aurora","Pescados Atlântico","Casco","18/11/2026 09:00","19/11/2026 16:00","Pendente"',
      ]);

      await page.search('zzz');
      expect(page.exportButton().disabled).toBe(true);
      page.fixture.destroy();

      // Seven rows over two pages: every one is exported.
      page = await DashboardPage.open({ workOrders: generated(7) });
      expect(page.codes()).toHaveLength(5);
      await click(page.exportButton());
      const exported = await lines();
      expect(exported).toHaveLength(8);
      expect(exported.slice(1).map((line) => line.split(',')[0])).toEqual(codes(1, 7).map((value) => `"${value}"`));
    } finally {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
    }
  });

  it('dashboard C21 creates a work order from the drawer', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await DashboardPage.open();

    await click(buttonByText('Nova ordem de serviço', page.element));
    const sheet = drawer()!;
    expect(squash(sheet.querySelector('[data-slot="sheet-title"]')?.textContent)).toBe('Nova ordem de serviço');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.value).toBe('');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.disabled).toBe(false);

    await type('#wo-vessel', 'v-lul');
    await type('#wo-service-name-0', 'Motor');
    await type('#wo-service-description-0', 'Revisão geral');
    await type('#wo-start', '2026-11-19T08:00');
    await type('#wo-end', '2026-11-21T17:30');
    await type('#wo-status', 'IN_PROGRESS');
    await click(buttonByText('Criar ordem', drawer()!));

    const post = controller.expectOne((req) => req.method === 'POST' && req.url === '/api/work-orders');
    expect(post.request.body).toEqual({
      vesselId: 'v-lul',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 21, 17, 30),
      status: 'IN_PROGRESS',
      services: [{ name: 'Motor', description: 'Revisão geral' }],
    });
    const created: WorkOrder = {
      id: 'ff001122-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      vesselId: 'v-lul',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 21, 17, 30),
      status: 'IN_PROGRESS',
      services: [
        { id: 'ff001122-s1', name: 'Motor', startDate: local(2026, 11, 19, 8, 0), endDate: local(2026, 11, 21, 17, 30), status: 'PENDING' },
      ],
    };
    post.flush({ workOrder: created }, { status: 201, statusText: 'Created' });
    await settle();
    await page.reload([...fleet, created]);

    expect(success).toHaveBeenCalledWith('Ordem de serviço criada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(page.cards()[0]).toEqual(['Ordens em aberto', '04']);
    expect(page.cards()[1]).toEqual(['Em execução', '03']);
    expect(page.codes()).toEqual(['#CD56EF78', '#AA000001', '#AB12CD34', '#FF001122']);
    expect(page.agendaItems()).toContainEqual(['08:00', 'Lula Branca', 'Serviço', 'Motor · #FF001122']);
    expect(page.agendaItems()).toContainEqual(['17:30', 'Lula Branca', 'Desdocagem', 'Desdocagem · #FF001122']);
  });

  it('dashboard C21 offers responsável to an administrator only', async () => {
    // An operator: no Responsável in the drawer.
    let page = await DashboardPage.open();
    await click(buttonByText('Nova ordem de serviço', page.element));
    expect(drawer()!.querySelector('#wo-service-assignee-0')).toBeNull();
    expect(drawer()!.textContent).not.toContain('Responsável');
    page.fixture.destroy();
    await settle();

    await as('administrator');
    page = await DashboardPage.open();
    await click(buttonByText('Nova ordem de serviço', page.element));
    const options = [...drawer()!.querySelectorAll<HTMLOptionElement>('#wo-service-assignee-0 option')].map((option) =>
      squash(option.textContent),
    );
    expect(squash(drawer()!.querySelector('label[for="wo-service-assignee-0"]')?.textContent)).toBe('Responsável');
    expect(options).toContain('Rafael Mendes · Mecânico naval');
    expect(options).toContain('Bravo · Hidráulica');

    await type('#wo-vessel', 'v-lul');
    await type('#wo-service-name-0', 'Motor');
    await type('#wo-service-description-0', 'Revisão geral');
    await type('#wo-service-assignee-0', 'team:bravo');
    await type('#wo-start', '2026-11-19T08:00');
    await type('#wo-end', '2026-11-21T17:30');
    await click(buttonByText('Criar ordem', drawer()!));

    const post = controller.expectOne((req) => req.method === 'POST' && req.url === '/api/work-orders');
    expect(post.request.body.services).toEqual([{ name: 'Motor', description: 'Revisão geral', teamId: 'bravo' }]);
    const created: WorkOrder = {
      id: 'ff001122-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      vesselId: 'v-lul',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 21, 17, 30),
      status: 'PENDING',
      services: [
        { id: 'ff001122-s1', name: 'Motor', startDate: local(2026, 11, 19, 8, 0), endDate: local(2026, 11, 21, 17, 30), status: 'PENDING' },
      ],
    };
    post.flush({ workOrder: created }, { status: 201, statusText: 'Created' });
    await settle();
    // With a Responsável the Assignments are read again for "Equipes em campo".
    await page.reload(
      [...fleet, created],
      [
        ...assignments,
        { id: 'a4', workOrderId: created.id, workOrderServiceId: 'ff001122-s1', staffId: null, teamId: 'bravo' },
      ],
    );
    expect(page.text('[data-slot="responsavel-name"]', page.rowOf('#FF001122'))).toBe('Equipe Bravo');
    expect(page.agendaItems()).toContainEqual(['08:00', 'Lula Branca', 'Serviço', 'Motor · Equipe Bravo']);
  });

  it('dashboard C23 shows skeletons and no sem responsável until the reads answer', async () => {
    const page = await DashboardPage.pending();
    const skeletons = () => ({
      cards: page.element.querySelectorAll('[data-slot="stat-skeleton"]').length,
      agenda: page.element.querySelectorAll('[data-slot="agenda-skeleton"]').length > 0,
      teams: page.element.querySelectorAll('[data-slot="team-skeleton"]').length > 0,
      table: page.element.querySelectorAll('[data-slot="skeleton-row"]').length > 0,
    });

    expect(skeletons()).toEqual({ cards: 4, agenda: true, teams: true, table: true });
    expect(page.rows()).toEqual([]);

    const requests = page.reads();
    page.answer(requests, { workOrders: fleet, vessels, customers });
    await settle();
    expect(skeletons()).toEqual({ cards: 4, agenda: true, teams: true, table: true });
    expect(page.element.textContent).not.toContain('Sem responsável');

    page.answer(requests, { staff, teams });
    await settle();
    expect(skeletons()).toEqual({ cards: 4, agenda: true, teams: true, table: true });
    expect(page.element.textContent).not.toContain('Sem responsável');
    expect(page.element.textContent).not.toContain('equipes mobilizadas');

    page.answer(requests, { assignments });
    await settle();
    expect(skeletons()).toEqual({ cards: 0, agenda: false, teams: false, table: false });
    expect(page.text('[data-slot="responsavel"]', page.rowOf('#CD56EF78'))).toBe('Sem responsável');
    expect(page.cards()).toEqual(FLEET_CARDS);
  });

  it('dashboard C23 toasts once and keeps the skeletons when a read fails', async () => {
    const error = vi.spyOn(toast, 'error');
    const data = { workOrders: fleet, vessels, customers, staff, teams, assignments };
    // Each read fails in turn; the parts that read it keep their skeletons, the others draw.
    const failures: [keyof Reads, string | null, string, string[]][] = [
      ['workOrders', 'Work order not found', 'Ordem de serviço não encontrada.', ['cards', 'agenda', 'teams', 'table']],
      ['vessels', 'Vessel not found', 'Embarcação não encontrada.', ['agenda', 'table']],
      ['customers', 'Customer not found', 'Cliente não encontrado.', ['table']],
      ['staff', 'Staff not found', 'Profissional não encontrado.', ['agenda', 'teams', 'table']],
      ['teams', 'Team not found', 'Equipe não encontrada.', ['cards', 'agenda', 'teams', 'table']],
      ['assignments', null, 'Não foi possível carregar a visão geral.', ['cards', 'agenda', 'teams', 'table']],
    ];

    for (const [failing, message, description, waiting] of failures) {
      error.mockClear();
      const page = await DashboardPage.pending();
      const requests = page.reads();
      const others = Object.fromEntries(Object.entries(data).filter(([read]) => read !== failing));
      page.answer(requests, others);
      requests[failing].flush(message ? { statusCode: 404, message } : null, {
        status: message ? 404 : 500,
        statusText: message ? 'Not Found' : 'Server Error',
      });
      await settle();

      expect(error.mock.calls, failing).toEqual([['Erro ao carregar a visão geral', { description }]]);
      const skeletons = {
        cards: page.element.querySelectorAll('[data-slot="stat-skeleton"]').length > 0,
        agenda: page.element.querySelectorAll('[data-slot="agenda-skeleton"]').length > 0,
        teams: page.element.querySelectorAll('[data-slot="team-skeleton"]').length > 0,
        table: page.element.querySelectorAll('[data-slot="skeleton-row"]').length > 0,
      };
      expect(
        Object.entries(skeletons)
          .filter(([, shown]) => shown)
          .map(([part]) => part),
        failing,
      ).toEqual(waiting);
      // Nothing false is drawn where a read is missing.
      const text = page.element.textContent ?? '';
      const falseWhileWaiting: Record<string, string[]> = {
        cards: ['equipes mobilizadas'],
        agenda: ['Nenhum item na agenda'],
        teams: ['Ainda não há equipes', 'técnicos ativos'],
        table: ['Sem responsável', 'Nenhuma ordem', 'Exibindo'],
      };
      for (const part of waiting) {
        for (const wrong of falseWhileWaiting[part]) expect(text, `${failing}: ${wrong}`).not.toContain(wrong);
      }
      if (waiting.includes('cards')) expect(page.cards(), failing).toEqual([]);
      page.fixture.destroy();
    }
  });

  it('dashboard C23 toasts once when several reads fail at once or one after another', async () => {
    const error = vi.spyOn(toast, 'error');
    const failAll = (requests: Reads, order: (keyof Reads)[]) =>
      order.map((read) => async () => {
        requests[read].flush({ statusCode: 404, message: 'Vessel not found' }, { status: 404, statusText: 'Not Found' });
        await settle();
      });

    // The six fail in one tick.
    let page = await DashboardPage.pending();
    let requests = page.reads();
    for (const read of Object.keys(requests) as (keyof Reads)[]) {
      requests[read].flush({ statusCode: 404, message: 'Vessel not found' }, { status: 404, statusText: 'Not Found' });
    }
    await settle();
    expect(error.mock.calls).toEqual([['Erro ao carregar a visão geral', { description: 'Embarcação não encontrada.' }]]);
    page.fixture.destroy();

    // The six fail one after another, each settled before the next.
    error.mockClear();
    page = await DashboardPage.pending();
    requests = page.reads();
    for (const fail of failAll(requests, ['staff', 'workOrders', 'teams', 'vessels', 'assignments', 'customers'])) {
      await fail();
    }
    expect(error).toHaveBeenCalledTimes(1);
    page.fixture.destroy();

    // Two of six fail in turn and the rest answer.
    error.mockClear();
    page = await DashboardPage.pending();
    requests = page.reads();
    page.answer(requests, { workOrders: fleet, vessels, customers, staff });
    await settle();
    for (const fail of failAll(requests, ['teams', 'assignments'])) await fail();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('dashboard C27 falls back to the last page left after a delete or an edit', async () => {
    const page = await DashboardPage.open({ workOrders: generated(7) });
    const sixth = generated(7)[5];
    const seventh = generated(7)[6];

    await page.goToPage(2);
    expect(page.codes()).toEqual(codes(6, 7));

    // An edit that closes #00000007: page 2 still holds #00000006.
    await click(buttonByText('Editar', await page.openMenu(code(7))));
    await type('#wo-status', 'COMPLETED');
    await click(buttonByText('Salvar alterações', drawer()!));
    controller.expectOne((req) => req.method === 'PUT' && req.url === `/api/work-orders/${seventh.id}`).flush(null);
    await settle();
    const closed = generated(7).map((order) => (order.id === seventh.id ? { ...order, status: 'COMPLETED' as const } : order));
    await page.reload(closed);
    expect(page.currentPage()).toBe('2');
    expect(page.codes()).toEqual([code(6)]);

    // A delete of the only row of page 2: the table shows page 1, never an empty page.
    await click(buttonByText('Excluir', await page.openMenu(code(6))));
    await click(buttonByText('Confirmar', document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!));
    controller.expectOne(`/api/work-orders/${sixth.id}`).flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    await page.reload(
      closed.filter((order) => order.id !== sixth.id),
      assignments,
    );
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(codes(1, 5));
    expect(page.range()).toBe('Exibindo 1–5 de 5 ordens');
    expect(page.pageButtons().map((button) => squash(button.textContent))).toEqual(['1']);
    expect(page.empty()).toBeUndefined();
  });

  it('dashboard C27 shows every open order after a create', async () => {
    const page = await DashboardPage.open();

    await click(page.tab('Pendentes'));
    await page.search('vento');
    expect(page.codes()).toEqual(['#CD56EF78']);

    await click(buttonByText('Nova ordem de serviço', page.element));
    await type('#wo-vessel', 'v-lul');
    await type('#wo-service-name-0', 'Motor');
    await type('#wo-service-description-0', 'Revisão geral');
    await type('#wo-start', '2026-11-19T08:00');
    await type('#wo-end', '2026-11-21T17:30');
    await type('#wo-status', 'IN_PROGRESS');
    await click(buttonByText('Criar ordem', drawer()!));
    const created: WorkOrder = {
      id: 'ff001122-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      vesselId: 'v-lul',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 21, 17, 30),
      status: 'IN_PROGRESS',
      services: [],
    };
    controller.expectOne((req) => req.method === 'POST' && req.url === '/api/work-orders').flush({ workOrder: created });
    await settle();
    await page.reload([...fleet, created]);

    // The new WorkOrder is in progress and Lula Branca's: it shows only with the tab and search reset.
    expect(page.selectedTabs()).toEqual(['Todas as ordens']);
    expect(page.searchField().value).toBe('');
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(['#CD56EF78', '#AA000001', '#AB12CD34', '#FF001122']);
  });

  it('dashboard C24 says when no work order is open', async () => {
    const page = await DashboardPage.open({ workOrders: [orderC, orderD, orderF] });

    expect(page.rows()).toEqual([]);
    expect(page.empty()).toBe('Nenhuma ordem de serviço em aberto.');
    expect(page.range()).toBe('Exibindo 0–0 de 0 ordens');
    expect(page.pageButtons()).toEqual([]);
    expect(squash(page.tab('Todas as ordens').textContent)).toBe('Todas as ordens 0');
    expect(page.exportButton().disabled).toBe(true);

    await page.search('aurora');
    expect(page.empty()).toBe('Nenhuma ordem de serviço em aberto.');
  });
});
