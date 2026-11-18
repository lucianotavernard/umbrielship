import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { Agenda } from '../agenda-page/agenda';
import {
  aurora,
  AURORA,
  BOREAL,
  button,
  buttons,
  cell,
  cells,
  choose,
  configure,
  fill,
  NOW,
  headers,
  headerTexts,
  itemsIn,
  metrics,
  panel,
  panelItems,
  renderAgenda,
  settle,
  text,
  vessels,
  workOrders,
} from './testing';

// Columns of the week of 16-22 Nov: 0 = Monday 16 … 6 = Sunday 22. Rows: 0 = "08:00" … 5 = "18:00".
const MON = 0;
const TUE = 1;
const WED = 2;
const SAT = 5;

describe('Agenda', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const label = (element: HTMLElement) => [
    text(element.querySelector('[data-slot="week-label"]')),
    text(element.querySelector('[data-slot="range-label"]')),
  ];
  const chips = (element: HTMLElement) =>
    element.querySelector<HTMLElement>('[aria-label="Filtrar por tipo de serviço"]')!;
  const search = (element: HTMLElement) =>
    element.querySelector<HTMLInputElement>('input[placeholder="Buscar serviço..."]')!;
  const gridItems = (element: HTMLElement) => itemsIn(element.querySelector('[data-slot="grid"]')!);
  const summary = (element: HTMLElement) =>
    [...panel(element).querySelectorAll('[data-slot="day-summary"] span')].map((part) =>
      text(part),
    );
  const drawer = (element: HTMLElement) => element.querySelector<HTMLElement>('[role="dialog"]');

  // ---------------------------------------------------------------- the drawer standard (AD-053)

  /** The header of a drawer, its close label and its `sm:` widths. */
  const frame = (sheet: HTMLElement) => ({
    kicker: text(sheet.querySelector('[data-slot="sheet-kicker"]')),
    title: text(sheet.querySelector('[data-slot="sheet-title"]')),
    description: text(sheet.querySelector('[data-slot="sheet-description"]')),
    close: sheet.querySelector(':scope > header button')?.getAttribute('aria-label'),
    widths: sheet.className.split(/\s+/).filter((token) => token.startsWith('sm:max-w-')),
  });

  /** A label as read, its `*` only when it is the required mark. */
  const labelOf = (field: Element) => {
    const copy = field.cloneNode(true) as Element;
    const mark = copy.querySelector('[data-slot="required-mark"]');
    mark?.remove();
    return mark ? `${text(copy)} ${text(mark)}` : text(copy);
  };

  const drawerCards = (sheet: HTMLElement) =>
    [...sheet.querySelectorAll<HTMLElement>('section[data-slot="drawer-card"]')].map((card) => ({
      title: text(card.querySelector('[data-slot="drawer-card-title"]')),
      subtitle: text(card.querySelector('[data-slot="drawer-card-subtitle"]')),
      icon: card.querySelector('[data-slot="drawer-card-icon"]')?.getAttribute('data-icon'),
      labels: [...card.querySelectorAll('label')].map(labelOf),
    }));

  const saveButton = (sheet: HTMLElement) =>
    sheet.querySelector<HTMLButtonElement>(
      'footer[data-slot="drawer-footer"] button[type="submit"]',
    )!;

  /** The footer: its hint, "Cancelar" (first icon, text) and the save button (type, first icon, text, disabled). */
  const footer = (sheet: HTMLElement) => {
    const bar = sheet.querySelector<HTMLElement>('footer[data-slot="drawer-footer"]')!;
    const [cancel, save] = [...bar.querySelectorAll<HTMLButtonElement>('button')];
    return {
      hint: text(bar.querySelector('[data-slot="required-hint"]')),
      cancel: [cancel.firstElementChild?.getAttribute('name'), text(cancel)],
      save: [save.type, save.firstElementChild?.getAttribute('name'), text(save), save.disabled],
    };
  };

  /** Each field: its control's id, whether it is marked invalid, and the messages under it. */
  const fieldStates = (sheet: HTMLElement) =>
    [...sheet.querySelectorAll('t-form-group')].map((group) => {
      const control = group.querySelector('input, select, textarea')!;
      return [
        control.id,
        control.hasAttribute('data-invalid'),
        [...group.querySelectorAll('[data-slot="error"]')].map((error) => text(error)),
      ];
    });

  async function click(target: HTMLElement) {
    target.click();
    await settle();
  }

  it('work-order-ui C58 requests work orders and vessels once and opens on the current week', async () => {
    TestBed.inject(AuthenticationService).role.set('operator');
    const fixture = TestBed.createComponent(Agenda);
    await settle();

    // Each read once, a GET with no `take` or any other query.
    for (const [url, body] of [
      ['/api/work-orders', { workOrders: workOrders(), total: 4 }],
      ['/api/vessels', { vessels, total: vessels.length }],
    ] as const) {
      const requests = controller.match((request) => request.url.split('?')[0] === url);
      expect(
        requests.map((request) => [request.request.method, request.request.urlWithParams]),
        url,
      ).toEqual([['GET', url]]);
      expect(requests[0].request.params.keys(), url).toEqual([]);
      requests[0].flush(body);
    }
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(text(element.querySelector('h1'))).toBe('Agenda');
    expect(headerTexts(element).map(([weekday, day]) => [weekday, day])).toEqual([
      ['SEG', '16'],
      ['TER', '17'],
      ['QUA', '18'],
      ['QUI', '19'],
      ['SEX', '20'],
      ['SÁB', '21'],
      ['DOM', '22'],
    ]);
    expect(label(element)).toEqual(['Novembro 2026', '16 de nov — 22 de nov']);
    // Today is highlighted and selected.
    expect(headers(element).map((header) => header.getAttribute('aria-current'))).toEqual([
      null,
      null,
      'date',
      null,
      null,
      null,
      null,
    ]);
    expect(headers(element).map((header) => header.hasAttribute('data-focused'))).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(text(panel(element).querySelector('h2'))).toBe('Quarta-feira, 18 de novembro');
    expect(button(element, 'Semana').getAttribute('aria-pressed')).toBe('true');
    expect(cells(element)).toHaveLength(6 * 7);
  });

  it('work-order-ui C59 shows each item with its time, vessel, name and code in its cell', async () => {
    const element = await renderAgenda(controller, 'operator');

    expect(
      [...element.querySelectorAll('[data-slot="grid"] > div:not([data-slot])')]
        .map((time) => text(time))
        .filter(Boolean),
    ).toEqual(['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']);
    // Docagem 06:00 in "08:00"; a service Tuesday 09:30 in Tuesday's "08:00".
    expect(itemsIn(cell(element, MON, 0))).toEqual([['06:00', 'Aurora', 'Docagem', '#AB12CD34']]);
    expect(itemsIn(cell(element, TUE, 0))).toEqual([
      ['09:30', 'Aurora', 'Pintura do casco', '#AB12CD34'],
    ]);
    // Sorted by time within a cell, whatever WorkOrder they come from.
    expect(itemsIn(cell(element, WED, 0))).toEqual([
      ['08:00', 'Boreal', 'Docagem', '#EF56AB78'],
      ['09:45', 'Aurora', 'Revisão do motor', '#AB12CD34'],
    ]);
    expect(itemsIn(cell(element, WED, 3))).toEqual([
      ['14:15', 'Boreal', 'Solda do leme', '#EF56AB78'],
    ]);
    // Desdocagem 21:00 in "18:00".
    expect(itemsIn(cell(element, SAT, 5))).toEqual([
      ['21:00', 'Aurora', 'Desdocagem', '#AB12CD34'],
    ]);
    // Nothing of the cancelled WorkOrder, nothing else in the week.
    expect(gridItems(element)).toHaveLength(6);
    expect(element.textContent).not.toContain('Cassiopeia');
    expect(element.textContent).not.toContain('Lixamento');
  });

  it('work-order-ui C60 the day headers count one item, many items or Livre', async () => {
    const element = await renderAgenda(controller, 'operator');

    expect(headerTexts(element)).toEqual([
      ['SEG', '16', '1 item'],
      ['TER', '17', '1 item'],
      ['QUA', '18', '3 itens'],
      ['QUI', '19', 'Livre'],
      ['SEX', '20', 'Livre'],
      ['SÁB', '21', '1 item'],
      ['DOM', '22', 'Livre'],
    ]);
  });

  it('work-order-ui C61 Hoje, Semana anterior and Próxima semana move the week', async () => {
    const element = await renderAgenda(controller, 'operator');
    const days = () => headerTexts(element).map(([, day]) => day);

    await click(button(element, 'Próxima semana'));
    expect(label(element)).toEqual(['Novembro 2026', '23 de nov — 29 de nov']);
    expect(days()).toEqual(['23', '24', '25', '26', '27', '28', '29']);
    expect(itemsIn(cell(element, 4, 2))).toEqual([['12:00', 'Boreal', 'Desdocagem', '#EF56AB78']]);

    await click(button(element, 'Próxima semana'));
    expect(label(element)).toEqual(['30 de nov — 06 de dez, 2026', '30 de nov — 06 de dez']);
    expect(days()).toEqual(['30', '1', '2', '3', '4', '5', '6']);

    await click(button(element, 'Hoje'));
    expect(label(element)).toEqual(['Novembro 2026', '16 de nov — 22 de nov']);
    expect(text(panel(element).querySelector('h2'))).toBe('Quarta-feira, 18 de novembro');
    expect(headers(element)[WED].getAttribute('aria-current')).toBe('date');

    await click(button(element, 'Semana anterior'));
    expect(label(element)).toEqual(['Novembro 2026', '09 de nov — 15 de nov']);
    expect(gridItems(element)).toEqual([
      ['10:00', 'Delfim', 'Docagem', '#DD00DD00'],
      ['16:00', 'Delfim', 'Desdocagem', '#DD00DD00'],
    ]);

    // In the "Dia" view the arrows read "Dia anterior" / "Próximo dia" and move one day (AD-049).
    await click(button(element, 'Hoje'));
    await click(button(element, 'Dia'));
    expect(headerTexts(element).map(([weekday, day]) => `${weekday} ${day}`)).toEqual(['QUA 18']);
    expect(buttons(element, 'Semana anterior')).toEqual([]);
    expect(buttons(element, 'Próxima semana')).toEqual([]);
    await click(button(element, 'Próximo dia'));
    expect(headerTexts(element).map(([weekday, day]) => `${weekday} ${day}`)).toEqual(['QUI 19']);
    await click(button(element, 'Dia anterior'));
    await click(button(element, 'Dia anterior'));
    expect(headerTexts(element).map(([weekday, day]) => `${weekday} ${day}`)).toEqual(['TER 17']);
    // Back in the week view they move the week again, from the day reached.
    await click(button(element, 'Semana'));
    expect(buttons(element, 'Dia anterior')).toEqual([]);
    await click(button(element, 'Próxima semana'));
    expect(label(element)).toEqual(['Novembro 2026', '23 de nov — 29 de nov']);
  });

  it('work-order-ui C62 Dia shows the selected day and a header selects it', async () => {
    const element = await renderAgenda(controller, 'operator');

    await click(headers(element)[TUE]);
    expect(headers(element).map((header) => header.hasAttribute('data-focused'))).toEqual([
      false,
      true,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(text(panel(element).querySelector('h2'))).toBe('Terça-feira, 17 de novembro');

    await click(button(element, 'Dia'));
    expect(button(element, 'Dia').getAttribute('aria-pressed')).toBe('true');
    expect(headerTexts(element)).toEqual([['TER', '17', '1 item']]);
    expect(cells(element)).toHaveLength(6);
    expect(gridItems(element)).toEqual([['09:30', 'Aurora', 'Pintura do casco', '#AB12CD34']]);

    await click(button(element, 'Semana'));
    expect(button(element, 'Semana').getAttribute('aria-pressed')).toBe('true');
    expect(headers(element)).toHaveLength(7);
    expect(cells(element)).toHaveLength(42);
    expect(headers(element)[TUE].hasAttribute('data-focused')).toBe(true);
  });

  it('work-order-ui C63 the type chips and the search filter grid, panel and metrics', async () => {
    const element = await renderAgenda(controller, 'operator');
    const values = () => metrics(element).map(([, value]) => value);
    const titles = () => gridItems(element).map(([, vessel, title]) => `${vessel} ${title}`);

    expect([...chips(element).querySelectorAll('button')].map((chip) => text(chip))).toEqual([
      'Todas 6',
      'Serviço',
      'Docagem',
      'Desdocagem',
    ]);
    expect(button(chips(element), 'Todas 6').getAttribute('aria-pressed')).toBe('true');

    await click(button(chips(element), 'Docagem'));
    expect(button(chips(element), 'Docagem').getAttribute('aria-pressed')).toBe('true');
    expect(titles()).toEqual(['Aurora Docagem', 'Boreal Docagem']);
    expect(values()).toEqual(['02', '02']);
    expect(panelItems(element)).toEqual([['08:00', 'Boreal', 'Docagem', '#EF56AB78']]);

    await click(button(chips(element), 'Desdocagem'));
    expect(titles()).toEqual(['Aurora Desdocagem']);
    expect(values()).toEqual(['01', '00']);
    expect(summary(element)).toEqual(['0 compromissos', 'Dia sem compromissos']);

    await click(button(chips(element), 'Serviço'));
    expect(titles()).toEqual([
      'Aurora Pintura do casco',
      'Aurora Revisão do motor',
      'Boreal Solda do leme',
    ]);
    expect(values()).toEqual(['03', '00']);

    await click(button(chips(element), 'Todas 6'));
    expect(titles()).toHaveLength(6);

    // Vessel name, service name or code, case-insensitive.
    fill(search(element), 'BOREAL');
    await settle();
    expect(titles()).toEqual(['Boreal Docagem', 'Boreal Solda do leme']);
    expect(values()).toEqual(['02', '01']);
    expect(text(chips(element).querySelector('button'))).toBe('Todas 2');
    expect(panelItems(element).map(([time]) => time)).toEqual(['08:00', '14:15']);

    fill(search(element), '#ab12cd');
    await settle();
    expect(titles()).toEqual([
      'Aurora Docagem',
      'Aurora Pintura do casco',
      'Aurora Revisão do motor',
      'Aurora Desdocagem',
    ]);
    expect(values()).toEqual(['04', '01']);

    fill(search(element), 'pintura');
    await settle();
    expect(titles()).toEqual(['Aurora Pintura do casco']);
    expect(values()).toEqual(['01', '00']);

    // The chip and the search together.
    fill(search(element), 'boreal');
    await settle();
    await click(button(chips(element), 'Serviço'));
    expect(titles()).toEqual(['Boreal Solda do leme']);

    await click(button(element, 'Limpar busca'));
    expect(search(element).value).toBe('');
    expect(buttons(element, 'Limpar busca')).toEqual([]);
    expect(titles()).toEqual([
      'Aurora Pintura do casco',
      'Aurora Revisão do motor',
      'Boreal Solda do leme',
    ]);
    expect(text(chips(element).querySelector('button'))).toBe('Todas 6');

    expect(controller.match(() => true)).toEqual([]);
  });

  it('work-order-ui C64 counts the week items and dockings', async () => {
    const element = await renderAgenda(controller, 'operator');

    expect(metrics(element)).toEqual([
      ['Compromissos na semana', '06', 'na programação'],
      ['Docagens programadas', '02', 'berço e área técnica'],
    ]);

    // The week shown, not the day selected nor every week.
    await click(headers(element)[MON]);
    expect(metrics(element).map(([, value]) => value)).toEqual(['06', '02']);
    await click(button(element, 'Próxima semana'));
    expect(metrics(element).map(([, value]) => value)).toEqual(['01', '00']);
    await click(button(element, 'Semana anterior'));
    await click(button(element, 'Semana anterior'));
    expect(metrics(element).map(([, value]) => value)).toEqual(['02', '01']);
  });

  it('work-order-ui C65 the day panel names the day, counts it and lists its items', async () => {
    const element = await renderAgenda(controller, 'operator');

    expect(panel(element).textContent).toContain('SELEÇÃO DO DIA');
    expect(text(panel(element).querySelector('h2'))).toBe('Quarta-feira, 18 de novembro');
    expect(summary(element)).toEqual(['3 compromissos', 'Dia produtivo']);
    // Each item: time, Vessel, name and, on its own line, the code.
    expect(panelItems(element)).toEqual([
      ['08:00', 'Boreal', 'Docagem', '#EF56AB78'],
      ['09:45', 'Aurora', 'Revisão do motor', '#AB12CD34'],
      ['14:15', 'Boreal', 'Solda do leme', '#EF56AB78'],
    ]);
    // A day with items offers no "Adicionar à agenda" in the panel.
    expect(buttons(panel(element), 'Adicionar à agenda')).toEqual([]);

    await click(headers(element)[TUE]);
    expect(text(panel(element).querySelector('h2'))).toBe('Terça-feira, 17 de novembro');
    expect(summary(element)).toEqual(['1 compromisso', 'Dia produtivo']);
    expect(panelItems(element)).toEqual([['09:30', 'Aurora', 'Pintura do casco', '#AB12CD34']]);

    await click(headers(element)[3]);
    expect(text(panel(element).querySelector('h2'))).toBe('Quinta-feira, 19 de novembro');
    expect(summary(element)).toEqual(['0 compromissos', 'Dia sem compromissos']);
    expect(panel(element).textContent).toContain('Aproveite para organizar uma nova manutenção.');
    expect(panelItems(element)).toEqual([]);

    // A day with no item offers "Adicionar à agenda", which opens the drawer at that day 08:00 (AD-049).
    await click(button(panel(element), 'Adicionar à agenda'));
    const sheet = element.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(text(sheet.querySelector('h2'))).toBe('Adicionar à agenda');
    expect(sheet.querySelector<HTMLInputElement>('#appointment-start')!.value).toBe('2026-11-19T08:00');
    await click(button(sheet, 'Cancelar'));
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(controller.match(() => true)).toEqual([]);
  });

  it('work-order-ui C66 an item opens its work order', async () => {
    const element = await renderAgenda(controller, 'operator');
    const router = TestBed.inject(Router);

    await click(
      cell(element, TUE, 0).querySelector<HTMLButtonElement>('[data-slot="agenda-item"]')!,
    );
    expect(router.url).toBe(`/work-orders/${AURORA}`);

    await click(panel(element).querySelector<HTMLButtonElement>('[data-slot="day-item"]')!);
    expect(router.url).toBe(`/work-orders/${BOREAL}`);
  });

  it('work-order-ui C67 a cell opens the drawer at its hour and adds a pending service to the grid', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await renderAgenda(controller, 'operator');

    // Wednesday's "10:00" row is empty.
    expect(itemsIn(cell(element, WED, 1))).toEqual([]);
    await click(
      button(cell(element, WED, 1), 'Criar compromisso em Quarta-feira, 18 de novembro às 10:00'),
    );

    const sheet = drawer(element)!;
    expect(text(sheet.querySelector('[data-slot="sheet-kicker"]'))).toBe('NOVO COMPROMISSO');
    expect(text(sheet.querySelector('h2'))).toBe('Adicionar à agenda');
    expect(text(sheet.querySelector('[data-slot="sheet-description"]'))).toBe(
      'Reserve um horário para um serviço da ordem.',
    );
    expect([...sheet.querySelectorAll('label')].map((field) => text(field))).toEqual([
      'Ordem de serviço *',
      'Serviço *',
      'Descrição *',
      'Início *',
      'Fim *',
    ]);
    // Only the WorkOrders PENDING or IN_PROGRESS.
    const workOrder = sheet.querySelector<HTMLSelectElement>('#appointment-work-order')!;
    expect([...workOrder.options].slice(1).map((option) => text(option))).toEqual([
      '#AB12CD34 · Aurora',
      '#EF56AB78 · Boreal',
    ]);
    expect(sheet.querySelector<HTMLInputElement>('#appointment-name')!.placeholder).toBe(
      'Ex.: Revisão do motor',
    );
    expect(sheet.querySelector<HTMLInputElement>('#appointment-start')!.value).toBe(
      '2026-11-18T10:00',
    );
    expect(sheet.querySelector<HTMLInputElement>('#appointment-end')!.value).toBe('');

    choose(workOrder, AURORA);
    fill(sheet.querySelector<HTMLInputElement>('#appointment-name')!, 'Troca de anodos');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-description')!, 'Anodos da popa');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-end')!, '2026-11-18T12:00');
    await settle();
    expect(buttons(sheet, 'Adicionar à agenda')).toEqual([]);
    await click(button(sheet, 'Agendar serviço'));

    const created = controller.expectOne(`/api/work-orders/${AURORA}/services`);
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Troca de anodos',
      description: 'Anodos da popa',
      startDate: new Date(2026, 10, 18, 10, 0).toISOString(),
      endDate: new Date(2026, 10, 18, 12, 0).toISOString(),
      status: 'PENDING',
    });
    created.flush(
      {
        id: 'svc-new',
        workOrderId: AURORA,
        name: 'Troca de anodos',
        description: 'Anodos da popa',
        status: 'PENDING',
      },
      { status: 201, statusText: 'Created' },
    );
    await settle();

    expect(success.mock.calls.map(([title]) => title)).toEqual(['Serviço criado com sucesso']);
    expect(drawer(element)).toBeNull();
    const reloaded = [
      aurora([
        {
          id: 'svc-new',
          name: 'Troca de anodos',
          startDate: new Date(2026, 10, 18, 10).toISOString(),
          endDate: new Date(2026, 10, 18, 12).toISOString(),
          status: 'PENDING',
        },
      ]),
      ...workOrders().slice(1),
    ];
    controller
      .expectOne({ method: 'GET', url: '/api/work-orders' })
      .flush({ workOrders: reloaded, total: reloaded.length });
    await settle();
    expect(itemsIn(cell(element, WED, 1))).toEqual([
      ['10:00', 'Aurora', 'Troca de anodos', '#AB12CD34'],
    ]);
  });

  it('workforce C27 Adicionar à agenda sends the responsável as staffId or teamId', async () => {
    const element = await renderAgenda(controller, 'administrator', workOrders(), {
      staff: [{ id: 'rafael', name: 'Rafael Mendes', specialty: 'Mecânico naval', email: 'r@x.test', phone: '1', teamId: null }],
      teams: [{ id: 'alfa', name: 'Equipe Alfa', specialty: 'Motor', staffCount: 0 }],
    });

    await click(button(element, 'Novo compromisso'));
    const sheet = drawer(element)!;
    choose(sheet.querySelector<HTMLSelectElement>('#appointment-work-order')!, AURORA);
    fill(sheet.querySelector<HTMLInputElement>('#appointment-name')!, 'Troca de anodos');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-description')!, 'Anodos da popa');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-end')!, '2026-11-18T12:00');
    choose(sheet.querySelector<HTMLSelectElement>('#appointment-assignee')!, 'team:alfa');
    await settle();
    await click(button(sheet, 'Agendar serviço'));

    const created = controller.expectOne(`/api/work-orders/${AURORA}/services`);
    expect(created.request.body).toMatchObject({ name: 'Troca de anodos', status: 'PENDING', teamId: 'alfa' });
    expect(created.request.body).not.toHaveProperty('staffId');
    created.flush({ id: 'svc-new' }, { status: 201, statusText: 'Created' });
    await settle();
    controller
      .expectOne({ method: 'GET', url: '/api/work-orders' })
      .flush({ workOrders: workOrders(), total: workOrders().length });
    await settle();
  });

  it('workforce C27 Adicionar à agenda shows no responsável to an operator', async () => {
    const element = await renderAgenda(controller, 'operator');

    await click(button(element, 'Novo compromisso'));
    expect(drawer(element)!.querySelector('#appointment-assignee')).toBeNull();
    expect(drawer(element)!.textContent).not.toContain('Responsável');
  });

  it('work-order-ui C67 Novo compromisso and Adicionar compromisso neste dia start at the selected day at 08:00', async () => {
    const element = await renderAgenda(controller, 'administrator');
    const start = () =>
      drawer(element)!.querySelector<HTMLInputElement>('#appointment-start')!.value;

    await click(headers(element)[4]);
    await click(button(element, 'Novo compromisso'));
    expect(start()).toBe('2026-11-20T08:00');
    await click(button(drawer(element)!, 'Cancelar'));
    expect(drawer(element)).toBeNull();

    await click(headers(element)[TUE]);
    await click(button(element, 'Adicionar compromisso neste dia'));
    expect(start()).toBe('2026-11-17T08:00');
    // The close button of every drawer reads "Fechar formulário" (drawer-standard AD-053).
    await click(button(drawer(element)!, 'Fechar formulário'));
    expect(drawer(element)).toBeNull();
    expect(controller.match(() => true)).toEqual([]);
  });

  it('work-order-ui C69 shows no team, availability, tide or demo text', async () => {
    const element = await renderAgenda(controller, 'administrator');

    for (const absent of [
      'Equipes escaladas',
      'Janelas livres',
      'Ver disponibilidade',
      'Todas as equipes',
      'CONDIÇÕES DO PORTO',
      'Equipes em operação',
      'Horário da oficina',
      'Dados de demonstração',
    ]) {
      expect(element.textContent, absent).not.toContain(absent);
    }
    expect(element.textContent).toContain('Serviços e docagens em um só rumo.');
  });

  it('work-order-ui C70 shows skeletons while loading and a toast when a request fails', async () => {
    const error = vi.spyOn(toast, 'error');
    TestBed.inject(AuthenticationService).role.set('operator');
    const answers: Record<string, object> = {
      '/api/work-orders': { workOrders: workOrders(), total: 4 },
      '/api/vessels': { vessels, total: vessels.length },
    };
    // Each read fails in turn, with a message of its own; the other one answers.
    const failures: [string, string, string][] = [
      ['/api/work-orders', 'Work order not found', 'Ordem de serviço não encontrada.'],
      ['/api/vessels', 'Vessel not found', 'Embarcação não encontrada.'],
    ];

    for (const [failing, message, description] of failures) {
      error.mockClear();
      const fixture = TestBed.createComponent(Agenda);
      await settle();
      const element = fixture.nativeElement as HTMLElement;

      expect(element.querySelectorAll('[data-slot="cell-skeleton"]'), failing).toHaveLength(42);
      expect(gridItems(element), failing).toEqual([]);

      for (const url of Object.keys(answers)) {
        const request = controller.expectOne({ method: 'GET', url });
        if (url === failing) {
          request.flush({ statusCode: 404, message }, { status: 404, statusText: 'Not Found' });
        } else {
          request.flush(answers[url]);
        }
      }
      await settle();

      expect(error.mock.calls, failing).toEqual([['Erro ao carregar a agenda', { description }]]);
      expect(element.querySelectorAll('[data-slot="cell-skeleton"]'), failing).toHaveLength(0);
      fixture.destroy();
    }
  });

  it('drawer-standard D12 Adicionar à agenda opens with the Serviço and Planejamento cards and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await renderAgenda(controller, 'operator');

    await click(button(element, 'Novo compromisso'));
    let sheet = drawer(element)!;

    expect(frame(sheet)).toEqual({
      kicker: 'NOVO COMPROMISSO',
      title: 'Adicionar à agenda',
      description: 'Reserve um horário para um serviço da ordem.',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    expect(drawerCards(sheet)).toEqual([
      {
        title: 'Serviço',
        subtitle: 'Escolha a ordem e descreva o serviço',
        icon: 'lucideWrench',
        labels: ['Ordem de serviço *', 'Serviço *', 'Descrição *'],
      },
      {
        title: 'Planejamento',
        subtitle: 'Defina o início e o fim do serviço',
        icon: 'lucideCalendarDays',
        labels: ['Início *', 'Fim *'],
      },
    ]);
    // "Descrição" is a multi-line field with no length limit.
    const description = sheet.querySelector('#appointment-description')!;
    expect(description.tagName).toBe('TEXTAREA');
    expect(description.hasAttribute('maxlength')).toBe(false);
    expect(document.activeElement?.id).toBe('appointment-work-order');
    expect(footer(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: ['lucideX', 'Cancelar'],
      save: ['submit', 'lucideCheck', 'Agendar serviço', false],
    });

    // Saved empty ("Início" emptied too): nothing sent, five messages each under its field.
    expect(sheet.querySelector<HTMLInputElement>('#appointment-start')!.value).toBe(
      '2026-11-18T08:00',
    );
    fill(sheet.querySelector<HTMLInputElement>('#appointment-start')!, '');
    await settle();
    await click(saveButton(sheet));
    expect(controller.match(() => true)).toEqual([]);
    const messages = [
      'Ordem de serviço é obrigatória',
      'Serviço é obrigatório',
      'Descrição é obrigatória',
      'Início é obrigatório',
      'Fim é obrigatório',
    ];
    expect(fieldStates(sheet)).toEqual([
      ['appointment-work-order', true, [messages[0]]],
      ['appointment-name', true, [messages[1]]],
      ['appointment-description', true, [messages[2]]],
      ['appointment-start', true, [messages[3]]],
      ['appointment-end', true, [messages[4]]],
    ]);
    // None at the end of the form: no other error, each message once, nothing after the last card.
    expect(sheet.querySelectorAll('[data-slot="error"]')).toHaveLength(5);
    expect(messages.map((message) => sheet.textContent!.split(message).length - 1)).toEqual([
      1, 1, 1, 1, 1,
    ]);
    const form = sheet.querySelector('form')!;
    expect([...form.children].map((part) => part.getAttribute('data-slot'))).toEqual([
      'drawer-body',
      'drawer-footer',
    ]);
    expect(
      text(
        form.querySelector('[data-slot="drawer-body"]')!.lastElementChild!.querySelector(
          '[data-slot="drawer-card-title"]',
        ),
      ),
    ).toBe('Planejamento');

    await click(button(sheet, 'Cancelar'));
    expect(drawer(element)).toBeNull();
    expect(controller.match(() => true)).toEqual([]);

    // Opened again from a cell: that cell's day and hour in "Início", nothing red, no message.
    await click(
      button(cell(element, WED, 1), 'Criar compromisso em Quarta-feira, 18 de novembro às 10:00'),
    );
    sheet = drawer(element)!;
    expect(sheet.querySelector<HTMLInputElement>('#appointment-start')!.value).toBe(
      '2026-11-18T10:00',
    );
    expect(fieldStates(sheet)).toEqual([
      ['appointment-work-order', false, []],
      ['appointment-name', false, []],
      ['appointment-description', false, []],
      ['appointment-start', false, []],
      ['appointment-end', false, []],
    ]);
    expect(sheet.querySelectorAll('[data-slot="error"], [data-invalid]')).toHaveLength(0);

    choose(sheet.querySelector<HTMLSelectElement>('#appointment-work-order')!, AURORA);
    fill(sheet.querySelector<HTMLInputElement>('#appointment-name')!, 'Troca de anodos');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-description')!, 'Anodos da popa');
    fill(sheet.querySelector<HTMLInputElement>('#appointment-end')!, '2026-11-18T12:00');
    await settle();
    await click(saveButton(sheet));

    expect(footer(sheet).save).toEqual(['submit', 'lucideLoader2', 'Salvando...', true]);
    const sent = controller.match(() => true);
    expect(
      sent.map(({ request }) => [request.method, request.urlWithParams, request.body]),
    ).toEqual([
      [
        'POST',
        `/api/work-orders/${AURORA}/services`,
        {
          name: 'Troca de anodos',
          description: 'Anodos da popa',
          startDate: new Date(2026, 10, 18, 10, 0).toISOString(),
          endDate: new Date(2026, 10, 18, 12, 0).toISOString(),
          status: 'PENDING',
        },
      ],
    ]);
    sent[0].flush(
      {
        id: 'svc-new',
        workOrderId: AURORA,
        name: 'Troca de anodos',
        description: 'Anodos da popa',
        status: 'PENDING',
      },
      { status: 201, statusText: 'Created' },
    );
    await settle();
    expect(success.mock.calls.map(([title]) => title)).toEqual(['Serviço criado com sucesso']);
    expect(drawer(element)).toBeNull();
    controller
      .expectOne({ method: 'GET', url: '/api/work-orders' })
      .flush({ workOrders: workOrders(), total: 4 });
    await settle();
  });
});
