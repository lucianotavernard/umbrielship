import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderDetail } from '../work-order-detail/work-order-detail';
import { buttonByText, click, drawer, local, settle, squash, type } from './work-order-list.harness';
import { answerWorkforce } from '../../../shared/testing/workforce';

registerLocaleData(localePtBr);

const ID = 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const BASE = `/api/work-orders/${ID}`;

/** Tuesday 17 to Friday 20 November 2026, in progress, on the cargo vessel Aurora of 32.5 m. */
const workOrder = {
  id: ID,
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status: 'IN_PROGRESS',
  vessel: { vesselId: 'v-aur', name: 'Aurora', type: 'CARGO', length: 32.5 },
};

/** `GET /api/vessels/v-aur`: the Vessel with its Customer. */
const auroraVessel = {
  id: 'v-aur',
  imoNumber: '9182451',
  name: 'Aurora',
  type: 'CARGO',
  length: 32.5,
  customerId: 'c-atl',
  customer: {
    id: 'c-atl',
    name: 'Pescados Atlântico',
    email: 'ops@atl.test',
    phone: '1',
    address: { address: 'Rua 1', city: 'Itajaí', state: 'SC' },
  },
};

const service = (id: string, name: string, description: string, status: string, day: number) => ({
  id,
  workOrderId: ID,
  name,
  description,
  startDate: local(2026, 11, day, 9, 0),
  endDate: local(2026, 11, day + 1, 17, 0),
  status,
});

const services = [
  service('svc-1', 'Motor', 'Revisão geral do motor', 'PENDING', 17),
  service('svc-2', 'Pintura', 'Casco completo', 'IN_PROGRESS', 18),
  service('svc-3', 'Hélice', 'Troca da hélice', 'COMPLETED', 19),
];

// The tones of the status pills (work-order-list.ts): grey, blue, green.
const TONES: Record<string, string[]> = {
  Pendente: ['bg-[#f0f2f4]', 'text-[#778590]'],
  'Em andamento': ['bg-[#edf4fb]', 'text-[#4e84b7]'],
  Concluído: ['bg-[#eaf5ef]', 'text-[#498b68]'],
};

describe('WorkOrderDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // The locale app.config.ts gives the app.
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function render(serviceList: object[] = services) {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services: serviceList, total: serviceList.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    answerWorkforce(controller);
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (root: ParentNode, selector: string) => squash(root.querySelector(selector)?.textContent);
  const servicesPanel = (element: HTMLElement) =>
    element.querySelector<HTMLElement>('section[aria-labelledby="work-order-services-title"]')!;
  const inspectionsPanel = (element: HTMLElement) =>
    element.querySelector<HTMLElement>('section[aria-labelledby="work-order-inspections-title"]')!;

  // drawer-standard: what every drawer shows, read the same way in each test (AD-053, AD-056, AD-057).
  const frameOf = (sheet: HTMLElement) => ({
    kicker: text(sheet, '[data-slot="sheet-kicker"]'),
    title: text(sheet, '[data-slot="sheet-title"]'),
    description: text(sheet, '[data-slot="sheet-description"]'),
    close: sheet.querySelector(':scope > header button')?.getAttribute('aria-label'),
    // The width the sheet takes from `sm`, and no other a page could add.
    widths: [...sheet.classList].filter((token) => token.startsWith('sm:max-w-')),
  });
  /** A label as read: its text, then its red required mark when it has one. */
  const labelOf = (label: Element) => {
    const marks = [...label.querySelectorAll('[data-slot="required-mark"]')].map((mark) => squash(mark.textContent));
    const bare = label.cloneNode(true) as Element;
    bare.querySelectorAll('[data-slot="required-mark"]').forEach((mark) => mark.remove());
    return [squash(bare.textContent), ...marks].join(' ');
  };
  const cardsOf = (sheet: HTMLElement) =>
    [...sheet.querySelectorAll<HTMLElement>('section[data-slot="drawer-card"]')].map((card) => ({
      title: text(card, '[data-slot="drawer-card-title"]'),
      subtitle: text(card, '[data-slot="drawer-card-subtitle"]'),
      icon: card.querySelector('[data-slot="drawer-card-icon"]')?.getAttribute('data-icon'),
      labels: [...card.querySelectorAll('label')].map(labelOf),
    }));
  /** The footer's sentence and its buttons: the icon that comes first, the text, the type and the state. */
  const footerOf = (sheet: HTMLElement) => {
    const footer = sheet.querySelector<HTMLElement>('footer[data-slot="drawer-footer"]')!;
    const button = (target: HTMLButtonElement | undefined) =>
      target
        ? {
            icon: target.firstElementChild?.matches('ng-icon') ? target.firstElementChild.getAttribute('name') : null,
            text: squash(target.textContent),
            type: target.type,
            disabled: target.disabled,
          }
        : null;
    const [cancel, save, ...more] = [...footer.querySelectorAll<HTMLButtonElement>('button')];
    return { hint: text(footer, '[data-slot="required-hint"]') ?? null, cancel: button(cancel), save: button(save), more: more.length };
  };
  const saving = { icon: 'lucideLoader2', text: 'Salvando...', type: 'submit', disabled: true };
  const saveButton = () => drawer()!.querySelector<HTMLButtonElement>('footer[data-slot="drawer-footer"] button[type="submit"]')!;
  /** Each field of the drawer by id, with the messages under it. */
  const messagesIn = (sheet: HTMLElement) =>
    Object.fromEntries(
      [...sheet.querySelectorAll('t-form-group')].map((group) => [
        group.querySelector('input, select, textarea')!.id,
        [...group.querySelectorAll('[data-slot="error"]')].map((error) => squash(error.textContent)),
      ]),
    );
  const invalidIn = (sheet: HTMLElement) => [...sheet.querySelectorAll('[data-invalid]')].map((element) => element.id);
  /** How many times `message` shows in the drawer: under its field and in no list elsewhere. */
  const timesIn = (sheet: HTMLElement, message: string) => (sheet.textContent ?? '').split(message).length - 1;
  /** Every request still open, as "METHOD url" (match() takes them). */
  const sent = () => controller.match(() => true).map((request) => `${request.request.method} ${request.request.urlWithParams}`);
  const TEMPLATES = '/api/inspection-templates?per_page=100';
  const templates = [
    { id: 'tpl-2', name: 'Solda', itemCount: 1, createdAt: '2026-11-14T10:00:00.000Z' },
    { id: 'tpl-1', name: 'Pintura do casco', itemCount: 3, createdAt: '2026-11-13T10:00:00.000Z' },
  ];

  it('work-order-ui C27 shows the breadcrumb, header, vessel and period without the empty panel', async () => {
    const element = await render();

    const crumbs = element.querySelector<HTMLElement>('nav[aria-label="Navegação estrutural"]')!;
    expect([...crumbs.children].map((part) => squash(part.textContent))).toEqual([
      'Ordens de serviço',
      '/',
      'OS #AB12CD34',
    ]);
    const back = crumbs.querySelector('a')!;
    expect(squash(back.textContent)).toBe('Ordens de serviço');
    expect(back.getAttribute('href')).toBe('/work-orders');

    expect(element.textContent).toContain('ORDEM DE SERVIÇO');
    expect(text(element, 'h1')).toBe('OS #AB12CD34');
    const badge = element.querySelector('section[aria-labelledby="work-order-title"] [data-slot="status"]')!;
    expect(squash(badge.textContent)).toBe('Em andamento');
    for (const tone of TONES['Em andamento']) expect([...badge.classList]).toContain(tone);

    const vessel = [...element.querySelectorAll('a')].find((link) => squash(link.textContent) === 'Aurora')!;
    expect(vessel.getAttribute('href')).toBe('/vessels/v-aur');
    const vesselPanel = text(element, '[data-slot="vessel"]')!;
    expect(vesselPanel).toContain('Carga');
    expect(vesselPanel).toContain('32,5 m');

    const start = text(element, '[data-slot="start"]')!;
    expect(start).toContain('Docagem');
    expect(start).toContain('17 de novembro de 2026, 09:12');
    expect(start.toLocaleLowerCase('pt-BR')).toContain('terça-feira');
    const end = text(element, '[data-slot="end"]')!;
    expect(end).toContain('Desdocagem');
    expect(end).toContain('20 de novembro de 2026, 10:00');
    expect(end.toLocaleLowerCase('pt-BR')).toContain('sexta-feira');

    expect(element.textContent).not.toContain('Atividade recente');
    expect(element.textContent).not.toContain('Voltar para detalhes da embarcação');
  });

  it('work-order-ui C28 lists the services and creates one from the Novo serviço drawer', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();
    const panel = servicesPanel(element);

    const headers = [...panel.querySelectorAll('thead th')].map((header) => squash(header.textContent));
    expect(headers.slice(0, 4).map((header) => header?.toLocaleUpperCase('pt-BR'))).toEqual([
      'SERVIÇO',
      'INÍCIO',
      'FIM',
      'STATUS',
    ]);
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-slot="service-row"]')].map((row) => ({
      name: text(row, '[data-slot="service-name"]'),
      description: text(row, '[data-slot="service-description"]'),
      start: text(row, '[data-slot="service-start"]'),
      end: text(row, '[data-slot="service-end"]'),
      status: text(row, '[data-slot="service-status"]'),
    }));
    expect(rows).toEqual([
      {
        name: 'Motor',
        description: 'Revisão geral do motor',
        start: '17/11/2026 09:00',
        end: '18/11/2026 17:00',
        status: 'Pendente',
      },
      {
        name: 'Pintura',
        description: 'Casco completo',
        start: '18/11/2026 09:00',
        end: '19/11/2026 17:00',
        status: 'Em andamento',
      },
      {
        name: 'Hélice',
        description: 'Troca da hélice',
        start: '19/11/2026 09:00',
        end: '20/11/2026 17:00',
        status: 'Concluído',
      },
    ]);
    for (const pill of panel.querySelectorAll('[data-slot="service-status"]')) {
      const label = squash(pill.textContent)!;
      for (const tone of TONES[label]) expect([...pill.classList], label).toContain(tone);
    }

    await click(buttonByText('Novo serviço', panel));
    const sheet = drawer()!;
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Novo serviço');
    const labels = [...sheet.querySelectorAll('label')].map((label) => squash(label.textContent)?.replace(/ \*$/, ''));
    expect(labels).toEqual(['Nome', 'Descrição', 'Início', 'Fim', 'Status']);

    await type('#svc-name', 'Leme');
    await type('#svc-description', 'Ajuste do leme');
    await type('#svc-start', '2026-11-19T08:00');
    await type('#svc-end', '2026-11-19T12:30');
    await type('#svc-status', 'IN_PROGRESS');
    await click(sheet.querySelector('form > footer button[type="submit"]'));

    const post = controller.expectOne(`${BASE}/services`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      name: 'Leme',
      description: 'Ajuste do leme',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 19, 12, 30),
      status: 'IN_PROGRESS',
    });
    post.flush(service('svc-4', 'Leme', 'Ajuste do leme', 'IN_PROGRESS', 19), { status: 201, statusText: 'Created' });
    await settle();
    const created = { ...service('svc-4', 'Leme', 'Ajuste do leme', 'IN_PROGRESS', 19) };
    const reload = controller.expectOne(`${BASE}/services`);
    expect(reload.request.method).toBe('GET');
    reload.flush({ services: [...services, created], total: 4 });
    await settle();

    expect(success).toHaveBeenCalledWith('Serviço criado com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(
      [...servicesPanel(element).querySelectorAll('[data-slot="service-name"]')].map((name) => squash(name.textContent)),
    ).toEqual(['Motor', 'Pintura', 'Hélice', 'Leme']);
  });

  it('work-order-ui C28 uploads a photo to the service images route', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    const input = element.querySelector<HTMLInputElement>('input[type="file"][aria-label="Enviar foto de Motor"]')!;
    expect(input).not.toBeNull();
    const file = new File(['PNG-S4'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
    await settle();

    const uploaded = controller.expectOne(`${BASE}/services/svc-1/images`);
    expect(uploaded.request.method).toBe('POST');
    expect(uploaded.request.body).toBeInstanceOf(FormData);
    expect((uploaded.request.body as FormData).get('file')).toBe(file);
    uploaded.flush({ image: { id: 'img-1', url: '/uploads/work-order-service-images/photo.png' } });
    await settle();

    expect(success).toHaveBeenCalledWith('Foto enviada', expect.anything());
  });

  it('work-order-ui C28 says no service was executed when there is none', async () => {
    const element = await render([]);
    const panel = servicesPanel(element);

    expect(panel.textContent).toContain('Nenhum serviço executado');
    expect(panel.textContent).toContain('Não há serviços registrados para esta ordem.');
    expect(panel.querySelectorAll('[data-slot="service-row"]').length).toBe(0);
    // A writer can still add the first one.
    expect(!!buttonByText('Novo serviço', panel)).toBe(true);
  });

  it('work-order-ui C25 Editar on the detail puts the new values and shows them', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    await click(buttonByText('Editar', element));
    // The drawer reads the Vessel for its Customer (C75).
    controller.expectOne('/api/vessels/v-aur').flush({ vessel: auroraVessel });
    await settle();
    const sheet = drawer()!;
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Editar ordem de serviço');
    const vessel = sheet.querySelector<HTMLSelectElement>('#wo-vessel')!;
    expect(vessel.disabled).toBe(true);
    expect(vessel.value).toBe('v-aur');
    expect(squash(vessel.selectedOptions[0]?.textContent)).toBe('Aurora');
    expect(sheet.textContent).not.toContain('Serviços a realizar');
    expect(sheet.querySelector('[id^="wo-service-"]')).toBeNull();
    expect(sheet.querySelector<HTMLInputElement>('#wo-start')!.value).toBe('2026-11-17T09:12');
    expect(sheet.querySelector<HTMLInputElement>('#wo-end')!.value).toBe('2026-11-20T10:00');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-status')!.value).toBe('IN_PROGRESS');
    expect(!!buttonByText('Salvar alterações', sheet)).toBe(true);

    await type('#wo-end', '2026-11-21T16:00');
    await type('#wo-status', 'COMPLETED');
    await click(buttonByText('Salvar alterações', sheet));

    const put = controller.expectOne(BASE);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 9, 12),
      endDate: local(2026, 11, 21, 16, 0),
      status: 'COMPLETED',
    });
    put.flush(null);
    await settle();
    const reload = controller.expectOne(BASE);
    expect(reload.request.method).toBe('GET');
    reload.flush({ workOrder: { ...workOrder, endDate: local(2026, 11, 21, 16, 0), status: 'COMPLETED' } });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(text(element, 'section[aria-labelledby="work-order-title"] [data-slot="status"]')).toBe('Concluído');
    expect(text(element, '[data-slot="end"]')).toContain('21 de novembro de 2026, 16:00');
  });

  it('work-order-ui C75 Editar on the detail shows the vessel\'s customer', async () => {
    const element = await render();
    // Nothing is read for the Customer until the drawer opens.
    controller.expectNone('/api/vessels/v-aur');

    await click(buttonByText('Editar', element));
    const read = controller.expectOne('/api/vessels/v-aur');
    expect(read.request.method).toBe('GET');
    read.flush({ vessel: auroraVessel });
    await settle();

    const customer = drawer()!.querySelector<HTMLInputElement>('#wo-customer')!;
    expect(customer.readOnly).toBe(true);
    expect(customer.value).toBe('Pescados Atlântico');
    expect(text(drawer()!, 'label[for="wo-customer"]')).toBe('Cliente responsável');

    // Closing and opening again reads the Vessel again, and shows its Customer of now.
    await click(buttonByText('Cancelar', drawer()!));
    expect(drawer()).toBeNull();
    await click(buttonByText('Editar', element));
    controller
      .expectOne('/api/vessels/v-aur')
      .flush({ vessel: { ...auroraVessel, customerId: 'c-mar', customer: { ...auroraVessel.customer, id: 'c-mar', name: 'Cooperativa Mar Azul' } } });
    await settle();
    expect(drawer()!.querySelector<HTMLInputElement>('#wo-customer')!.value).toBe('Cooperativa Mar Azul');
  });

  it('work-order-ui C30 a 404 shows the not found state with the way back', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    const notFound = { message: 'Work order not found' };
    controller.expectOne(BASE).flush(notFound, { status: 404, statusText: 'Not Found' });
    controller.expectOne(`${BASE}/services`).flush(notFound, { status: 404, statusText: 'Not Found' });
    controller.expectOne(`${BASE}/inspection-assignments`).flush(notFound, { status: 404, statusText: 'Not Found' });
    answerWorkforce(controller);
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    expect(text(element, 'h1')).toBe('Ordem de serviço não encontrada');
    expect(element.textContent).toContain('Esse registro não está disponível na sua organização.');
    const back = [...element.querySelectorAll('a')].find(
      (link) => squash(link.textContent) === 'Voltar para ordens de serviço',
    )!;
    expect(back.getAttribute('href')).toBe('/work-orders');
  });

  it('work-order-ui C31 shows skeletons while the work order loads', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const header = element.querySelector<HTMLElement>('section[aria-labelledby="work-order-title"]')!;
    expect(header.querySelectorAll('t-skeleton').length).toBeGreaterThan(0);
    expect(element.querySelector('h1')).toBeNull();
    expect(servicesPanel(element).querySelectorAll('t-skeleton').length).toBeGreaterThan(0);
    expect(inspectionsPanel(element).querySelectorAll('t-skeleton').length).toBeGreaterThan(0);

    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services, total: services.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    answerWorkforce(controller);
    await settle();

    expect(element.querySelectorAll('t-skeleton').length).toBe(0);
    expect(text(element, 'h1')).toBe('OS #AB12CD34');
  });

  it('drawer-standard D4 Editar ordem de serviço focuses Docagem and puts once', async () => {
    const element = await render();
    const openEdit = async () => {
      await click(buttonByText('Editar', element));
      // The drawer reads the Vessel for its Customer (C75).
      controller.expectOne({ method: 'GET', url: '/api/vessels/v-aur' }).flush({ vessel: auroraVessel });
      await settle();
      return drawer()!;
    };
    let sheet = await openEdit();

    expect(frameOf(sheet)).toEqual({
      kicker: 'ORDEM DE SERVIÇO',
      title: 'Editar ordem de serviço',
      description: 'Atualize o período e o status da ordem de serviço.',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    expect(cardsOf(sheet)).toEqual([
      {
        title: 'Embarcação e cliente',
        subtitle: 'Identifique a embarcação atendida',
        icon: 'lucideShip',
        labels: ['Embarcação *', 'Cliente responsável'],
      },
      {
        title: 'Planejamento',
        subtitle: 'Defina o período e o status da ordem',
        icon: 'lucideCalendarDays',
        labels: ['Docagem *', 'Desdocagem *', 'Status'],
      },
    ]);
    // The Vessel is locked, so the first field that takes input is Docagem.
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.disabled).toBe(true);
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.value).toBe('v-aur');
    expect(sheet.querySelector<HTMLInputElement>('#wo-customer')!.value).toBe('Pescados Atlântico');
    expect(document.activeElement?.id).toBe('wo-start');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Salvar alterações', type: 'submit', disabled: false },
      more: 0,
    });
    expect(invalidIn(sheet)).toEqual([]);

    // Docagem and Desdocagem cleared: nothing is sent, each speaks under itself.
    await type('#wo-start', '');
    await type('#wo-end', '');
    await type('#wo-status', 'COMPLETED');
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({
      'wo-vessel': [],
      'wo-customer': [],
      'wo-start': ['Data de início é obrigatória'],
      'wo-end': ['Data de fim é obrigatória'],
      'wo-status': [],
    });
    expect(invalidIn(sheet)).toEqual(['wo-start', 'wo-end']);
    for (const message of ['Data de início é obrigatória', 'Data de fim é obrigatória']) {
      expect(timesIn(sheet, message), message).toBe(1);
    }

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);

    // The same WorkOrder again: its stored values, nothing red.
    sheet = await openEdit();
    expect(sheet.querySelector<HTMLInputElement>('#wo-start')!.value).toBe('2026-11-17T09:12');
    expect(sheet.querySelector<HTMLInputElement>('#wo-end')!.value).toBe('2026-11-20T10:00');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-status')!.value).toBe('IN_PROGRESS');
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await type('#wo-end', '2026-11-21T16:00');
    await type('#wo-status', 'COMPLETED');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual(saving);

    const put = controller.expectOne({ method: 'PUT', url: BASE });
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 9, 12),
      endDate: local(2026, 11, 21, 16, 0),
      status: 'COMPLETED',
    });
    put.flush(null);
    await settle();
    controller
      .expectOne({ method: 'GET', url: BASE })
      .flush({ workOrder: { ...workOrder, endDate: local(2026, 11, 21, 16, 0), status: 'COMPLETED' } });
    await settle();
    expect(drawer()).toBeNull();
  });

  it('drawer-standard D5 Novo serviço opens with the Serviço and Planejamento cards and posts once', async () => {
    const element = await render();
    const open = async () => {
      await click(buttonByText('Novo serviço', servicesPanel(element)));
      await settle();
      return drawer()!;
    };
    let sheet = await open();

    expect(frameOf(sheet)).toEqual({
      kicker: 'ORDEM DE SERVIÇO',
      title: 'Novo serviço',
      description: 'Preencha os campos abaixo para criar um novo serviço',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    expect(cardsOf(sheet)).toEqual([
      {
        title: 'Serviço',
        subtitle: 'Identifique o serviço a realizar',
        icon: 'lucideWrench',
        labels: ['Nome *', 'Descrição *'],
      },
      {
        title: 'Planejamento',
        subtitle: 'Defina o período e o status do serviço',
        icon: 'lucideCalendarDays',
        labels: ['Início *', 'Fim *', 'Status'],
      },
    ]);
    // "Descrição" is a multi-line field with no length limit.
    const description = sheet.querySelector<HTMLTextAreaElement>('#svc-description')!;
    expect(description.tagName).toBe('TEXTAREA');
    expect(description.hasAttribute('maxlength')).toBe(false);
    expect(description.maxLength).toBe(-1);
    expect(document.activeElement?.id).toBe('svc-name');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Criar serviço', type: 'submit', disabled: false },
      more: 0,
    });
    expect(invalidIn(sheet)).toEqual([]);
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);

    // Saved empty: nothing is sent, each required field speaks under itself and nowhere else.
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({
      'svc-name': ['Nome é obrigatório'],
      'svc-description': ['Descrição é obrigatória'],
      'svc-start': ['Data de início é obrigatória'],
      'svc-end': ['Data de fim é obrigatória'],
      'svc-status': [],
    });
    expect(invalidIn(sheet)).toEqual(['svc-name', 'svc-description', 'svc-start', 'svc-end']);
    for (const message of ['Nome é obrigatório', 'Descrição é obrigatória', 'Data de início é obrigatória', 'Data de fim é obrigatória']) {
      expect(timesIn(sheet, message), message).toBe(1);
    }
    expect(saveButton().disabled).toBe(false);

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);

    // Opened again: clean.
    sheet = await open();
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await type('#svc-name', 'Leme');
    await type('#svc-description', 'Ajuste do leme\ne troca da cana');
    await type('#svc-start', '2026-11-19T08:00');
    await type('#svc-end', '2026-11-19T12:30');
    await type('#svc-status', 'IN_PROGRESS');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual(saving);

    const post = controller.expectOne({ method: 'POST', url: `${BASE}/services` });
    expect(post.request.body).toEqual({
      name: 'Leme',
      description: 'Ajuste do leme\ne troca da cana',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 19, 12, 30),
      status: 'IN_PROGRESS',
    });
    const created = service('svc-4', 'Leme', 'Ajuste do leme\ne troca da cana', 'IN_PROGRESS', 19);
    post.flush(created, { status: 201, statusText: 'Created' });
    await settle();
    controller.expectOne({ method: 'GET', url: `${BASE}/services` }).flush({ services: [...services, created], total: 4 });
    await settle();
    expect(drawer()).toBeNull();
  });

  it('drawer-standard D6 Atribuir modelo de inspeção opens with the Atribuição card and posts once', async () => {
    // Only an Administrator assigns templates.
    TestBed.inject(AuthenticationService).role.set('administrator');
    const element = await render();
    const open = async () => {
      await click(buttonByText('Atribuir modelo', inspectionsPanel(element)));
      controller.expectOne({ method: 'GET', url: TEMPLATES }).flush({ inspectionTemplates: templates, total: templates.length });
      await settle();
      return drawer()!;
    };
    let sheet = await open();

    expect(frameOf(sheet)).toEqual({
      kicker: 'ATRIBUIR INSPEÇÃO',
      title: 'Atribuir modelo de inspeção',
      description: 'Escolha o modelo e o alvo; as perguntas do modelo são copiadas para esta ordem',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    expect(cardsOf(sheet)).toEqual([
      {
        title: 'Atribuição',
        subtitle: 'Escolha o modelo e o alvo',
        icon: 'lucideClipboardCheck',
        labels: ['Modelo *', 'Alvo'],
      },
    ]);
    expect(document.activeElement?.id).toBe('assignment-template');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Atribuir inspeção', type: 'submit', disabled: false },
      more: 0,
    });
    expect(invalidIn(sheet)).toEqual([]);
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);

    // Saved with no template: nothing is sent, "Modelo" speaks under itself.
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({ 'assignment-template': ['Modelo é obrigatório'], 'assignment-target': [] });
    expect(invalidIn(sheet)).toEqual(['assignment-template']);
    expect(timesIn(sheet, 'Modelo é obrigatório')).toBe(1);
    expect(saveButton().disabled).toBe(false);

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);

    // Opened again: clean.
    sheet = await open();
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await type('#assignment-template', 'tpl-1');
    await type('#assignment-target', 'svc-2');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual(saving);

    const post = controller.expectOne({ method: 'POST', url: `${BASE}/inspection-assignments` });
    expect(post.request.body).toEqual({ templateId: 'tpl-1', serviceId: 'svc-2' });
    post.flush({ inspectionAssignment: { id: 'a-1' } }, { status: 201, statusText: 'Created' });
    await settle();
    controller.expectOne({ method: 'GET', url: `${BASE}/inspection-assignments` }).flush({ inspectionAssignments: [] });
    await settle();
    expect(drawer()).toBeNull();
  });

  it('drawer-standard D6 without templates shows the message in a card and only Cancelar', async () => {
    TestBed.inject(AuthenticationService).role.set('administrator');
    const element = await render();
    await click(buttonByText('Atribuir modelo', inspectionsPanel(element)));
    controller.expectOne({ method: 'GET', url: TEMPLATES }).flush({ inspectionTemplates: [], total: 0 });
    await settle();
    const sheet = drawer()!;

    expect(frameOf(sheet)).toEqual({
      kicker: 'ATRIBUIR INSPEÇÃO',
      title: 'Atribuir modelo de inspeção',
      description: 'Escolha o modelo e o alvo; as perguntas do modelo são copiadas para esta ordem',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    expect(cardsOf(sheet)).toEqual([
      { title: 'Atribuição', subtitle: 'Escolha o modelo e o alvo', icon: 'lucideClipboardCheck', labels: [] },
    ]);
    // The message sits in the card, the only place it shows, with no field to fill.
    const card = sheet.querySelector('section[data-slot="drawer-card"]')!;
    expect(card.textContent).toContain('Nenhum modelo de inspeção cadastrado');
    expect(timesIn(sheet, 'Nenhum modelo de inspeção cadastrado')).toBe(1);
    expect(sheet.querySelectorAll('input, select, textarea').length).toBe(0);
    expect(footerOf(sheet)).toEqual({
      hint: null,
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: null,
      more: 0,
    });
    expect(sheet.textContent).not.toContain('Campos obrigatórios');

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);
  });

  it('drawer-standard D6 with a failed template load shows the error in a card and only Cancelar', async () => {
    TestBed.inject(AuthenticationService).role.set('administrator');
    const element = await render();
    await click(buttonByText('Atribuir modelo', inspectionsPanel(element)));
    controller
      .expectOne({ method: 'GET', url: TEMPLATES })
      .flush({ statusCode: 500, message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    await settle();
    const sheet = drawer()!;

    expect(frameOf(sheet).kicker).toBe('ATRIBUIR INSPEÇÃO');
    expect(cardsOf(sheet)).toEqual([
      { title: 'Atribuição', subtitle: 'Escolha o modelo e o alvo', icon: 'lucideClipboardCheck', labels: [] },
    ]);
    const card = sheet.querySelector('section[data-slot="drawer-card"]')!;
    expect(card.textContent).toContain('Não foi possível carregar os modelos de inspeção.');
    expect(timesIn(sheet, 'Não foi possível carregar os modelos de inspeção.')).toBe(1);
    expect(sheet.textContent).not.toContain('Nenhum modelo de inspeção cadastrado');
    expect(sheet.querySelectorAll('input, select, textarea').length).toBe(0);
    expect(footerOf(sheet)).toEqual({
      hint: null,
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: null,
      more: 0,
    });
    expect(sheet.textContent).not.toContain('Campos obrigatórios');

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);
  });
});

describe('WorkOrderDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  it('workforce C28 shows the responsável of each service', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services, total: services.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    // Every Role reads who answers for each service.
    controller.expectOne('/api/staff').flush({
      staff: [{ id: 'rafael', name: 'Rafael Mendes', specialty: 'Mecânico naval', email: 'r@x.test', phone: '1', teamId: null }],
    });
    controller.expectOne('/api/teams').flush({ teams: [{ id: 'alfa', name: 'Alfa', specialty: 'Motor', staffCount: 0 }] });
    controller.expectOne('/api/assignments').flush({
      assignments: [
        { id: 'a1', workOrderId: ID, workOrderServiceId: 'svc-1', staffId: 'rafael', teamId: null },
        { id: 'a2', workOrderId: ID, workOrderServiceId: 'svc-2', staffId: null, teamId: 'alfa' },
      ],
    });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const rows = [...element.querySelectorAll<HTMLElement>('[data-slot="service-row"]')].map((row) => [
      squash(row.querySelector('[data-slot="service-name"]')?.textContent),
      squash(row.querySelector('[data-slot="service-assignee"]')?.textContent),
    ]);
    expect(rows).toEqual([
      ['Motor', 'Responsável: Rafael Mendes'],
      ['Pintura', 'Responsável: Equipe Alfa'],
      ['Hélice', 'Sem responsável'],
    ]);
  });

  async function renderReads(role: 'administrator' | 'operator') {
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services, total: services.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  const rafael = { id: 'rafael', name: 'Rafael Mendes', specialty: 'Mecânico naval', email: 'r@x.test', phone: '1', teamId: null };
  const alfa = { id: 'alfa', name: 'Alfa', specialty: 'Motor', staffCount: 0 };
  const onMotor = [{ id: 'a1', workOrderId: ID, workOrderServiceId: 'svc-1', staffId: 'rafael', teamId: null }];
  const assignees = (element: HTMLElement) =>
    [...element.querySelectorAll('[data-slot="service-assignee"]')].map((label) => squash(label.textContent));

  it('workforce C41 shows no responsável until the workforce reads answer and toasts a failure', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await renderReads('administrator');

    // Loading: no service reads "Sem responsável", and "Editar" sends no services.
    expect(assignees(element)).toEqual([]);
    await click(buttonByText('Editar', element));
    controller.expectOne('/api/vessels/v-aur').flush({ vessel: auroraVessel });
    await settle();
    expect(drawer()!.querySelector('[data-slot="existing-service"]')).toBeNull();
    await click(buttonByText('Salvar alterações', drawer()!));
    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === BASE);
    expect(put.request.body).not.toHaveProperty('services');
    put.flush(null);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });

    controller.expectOne('/api/staff').flush({ staff: [rafael] });
    controller.expectOne('/api/teams').flush({ teams: [alfa] });
    controller.expectOne('/api/assignments').flush({ message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    await settle();
    expect(error).toHaveBeenCalledWith('Erro ao carregar os responsáveis', {
      description: 'Não foi possível carregar os responsáveis.',
    });
    expect(assignees(element)).toEqual([]);
  });

  it('workforce C41 edits the responsável from the detail once the reads answered', async () => {
    const element = await renderReads('administrator');
    answerWorkforce(controller, { staff: [rafael], teams: [alfa], assignments: onMotor });
    await settle();

    expect(assignees(element)).toEqual(['Responsável: Rafael Mendes', 'Sem responsável', 'Sem responsável']);
    await click(buttonByText('Editar', element));
    controller.expectOne('/api/vessels/v-aur').flush({ vessel: auroraVessel });
    await settle();
    expect(drawer()!.querySelectorAll('[data-slot="existing-service"]')).toHaveLength(3);
    await type('#wo-existing-assignee-1', 'team:alfa');
    await click(buttonByText('Salvar alterações', drawer()!));
    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === BASE);
    expect(put.request.body.services).toEqual([
      { id: 'svc-1', staffId: 'rafael' },
      { id: 'svc-2', teamId: 'alfa' },
      { id: 'svc-3' },
    ]);
    put.flush(null);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne('/api/assignments').flush({ assignments: onMotor });
    await settle();
  });

  it('workforce C27 Novo serviço on the detail sends the responsável chosen by an administrator', async () => {
    const element = await renderReads('administrator');
    answerWorkforce(controller, { staff: [rafael], teams: [alfa], assignments: [] });
    await settle();

    await click(buttonByText('Novo serviço', element));
    await type('#svc-name', 'Pintura do convés');
    await type('#svc-description', 'Duas demãos');
    await type('#svc-start', '2026-11-18T08:00');
    await type('#svc-end', '2026-11-18T17:00');
    await type('#svc-assignee', 'staff:rafael');
    await click(buttonByText('Criar serviço', drawer()!));

    const post = controller.expectOne((req) => req.method === 'POST' && req.url === `${BASE}/services`);
    expect(post.request.body).toMatchObject({ name: 'Pintura do convés', staffId: 'rafael' });
    expect(post.request.body).not.toHaveProperty('teamId');
    post.flush({ service: { id: 'svc-4' } });
    await settle();
    controller.expectOne(`${BASE}/services`).flush({ services, total: services.length });
    controller.expectOne('/api/assignments').flush({ assignments: [] });
    await settle();
  });

  it('workforce C27 Novo serviço on the detail shows no responsável to an operator', async () => {
    const element = await renderReads('operator');
    answerWorkforce(controller);
    await settle();

    await click(buttonByText('Novo serviço', element));
    expect(drawer()!.querySelector('#svc-assignee')).toBeNull();
    expect(drawer()!.textContent).not.toContain('Responsável');
  });
});
