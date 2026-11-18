import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { VesselDetail } from '../vessel-detail/vessel-detail';

const atlantic = {
  id: 'c-atl',
  name: 'Pescados Atlântico',
  email: 'ops@atlantico.test',
  phone: '47966665555',
  address: { address: 'Rua 1', city: 'Itajaí', state: 'SC' },
};

const aurora = {
  id: 'vessel-1',
  imoNumber: '9182451',
  name: 'Santa Maria',
  type: 'FISHING',
  length: 32.5,
  customerId: 'c-atl',
  customer: atlantic,
};

const workOrder = {
  id: '5fbe9f04-aaaa-4bbb-8ccc-dddddddddddd',
  vesselId: 'vessel-1',
  startDate: '2026-11-10T12:00:00.000Z',
  endDate: '2026-11-15T12:00:00.000Z',
  status: 'IN_PROGRESS',
};

const page = (skip: number) => `/api/work-orders?vesselId=vessel-1&take=10&skip=${skip}`;

registerLocaleData(localePtBr);

describe('VesselDetail', () => {
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

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  async function render(vessel: object = aurora, workOrders: object[] = [workOrder], total = workOrders.length) {
    const fixture = TestBed.createComponent(VesselDetail);
    fixture.componentRef.setInput('id', 'vessel-1');
    await settle();
    controller.expectOne('/api/vessels/vessel-1').flush({ vessel });
    controller.expectOne(page(0)).flush({ workOrders, total });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  async function type(selector: string, value: string) {
    const field = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  }

  async function click(target: Element | null | undefined) {
    if (!target) throw new Error('nothing to click');
    (target as HTMLElement).click();
    await settle();
  }

  const buttonByText = (text: string, root: ParentNode) =>
    [...root.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim() === text);
  const text = (root: ParentNode, selector: string) =>
    root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  // drawer-standard: what every drawer shows, read the same way in each test (AD-053, AD-056, AD-057).
  const squash = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim();
  const drawer = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
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

  it('customer-ui C46 shows the FROTA profile and Voltar à frota links to /vessels', async () => {
    const element = await render();

    const back = [...element.querySelectorAll('a')].find((link) => link.textContent?.trim() === 'Voltar à frota');
    expect(back?.getAttribute('href')).toBe('/vessels');
    expect(text(element, 'nav[aria-label="Navegação estrutural"]')).toContain('Santa Maria');
    expect(element.textContent).toContain('FROTA');
    expect(element.textContent).not.toContain('FROTA /');
    expect(text(element, 'h1')).toBe('Santa Maria');
    expect(text(element, '[data-slot="type-pill"]')).toBe('Pesca');
    expect(element.textContent).toContain('Informações cadastrais e operacionais da embarcação.');
    for (const gone of ['Porto base', 'Ativa', 'Em manutenção', 'Inativa']) {
      expect(element.textContent).not.toContain(gone);
    }
  });

  it('customer-ui C47 shows the IMO number and the length in pt-BR', async () => {
    const element = await render();
    expect(text(element, '[data-slot="spec-imo"] dd')).toBe('9182451');
    expect(text(element, '[data-slot="spec-length"] dd')).toBe('32,5 m');
  });

  it('customer-ui C47 shows Não informado for a missing IMO number', async () => {
    const element = await render({ ...aurora, imoNumber: '' });
    expect(text(element, '[data-slot="spec-imo"] dd')).toBe('Não informado');
  });

  it('customer-ui C48 Editar saves the vessel and shows the new values', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    await click(buttonByText('Editar', element));
    const sheet = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Editar embarcação');
    expect(sheet.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Santa Maria');
    // What is typed and cancelled never comes back on the next Editar.
    await type('#vessel-name', 'Digitado e cancelado');
    await click(buttonByText('Cancelar', sheet));
    await click(buttonByText('Editar', element));
    const again = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    expect(again.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Santa Maria');

    await type('#vessel-name', 'Santa Maria II');
    await type('#length', '33.5');
    await click(buttonByText('Salvar alterações', again));

    const put = controller.expectOne('/api/customers/c-atl/vessels/vessel-1');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ customerId: 'c-atl', name: 'Santa Maria II', type: 'FISHING', length: 33.5 });
    put.flush({ vessel: {} });
    await settle();
    controller.expectOne('/api/vessels/vessel-1').flush({ vessel: { ...aurora, name: 'Santa Maria II', length: 33.5 } });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação atualizada com sucesso', expect.anything());
    expect(text(element, 'h1')).toBe('Santa Maria II');
    expect(text(element, '[data-slot="spec-length"] dd')).toBe('33,5 m');
  });

  it('customer-ui C49 lists the work orders with the code and the long dates', async () => {
    // 22:00 local on 10 November: the day the user typed, not the UTC day after it.
    const lateEvening = {
      ...workOrder,
      startDate: new Date(2026, 10, 10, 22, 0).toISOString(),
      endDate: new Date(2026, 10, 15, 23, 30).toISOString(),
    };
    const element = await render(aurora, [lateEvening]);

    const headers = [...element.querySelectorAll('thead th')].map((header) => header.textContent?.trim());
    expect(headers.slice(0, 4)).toEqual(['Ordem', 'Docagem', 'Desdocagem', 'Status']);
    const row = element.querySelector<HTMLElement>('[data-slot="work-order-row"]')!;
    const code = row.querySelector('a')!;
    expect(code.textContent?.trim()).toBe('#5FBE9F04');
    expect(code.getAttribute('href')).toBe(`/work-orders/${workOrder.id}`);
    expect(text(row, '[data-slot="start-date"]')).toBe('10 de novembro de 2026');
    expect(text(row, '[data-slot="end-date"]')).toBe('15 de novembro de 2026');
    expect(text(row, '[data-slot="status"]')).toBe('Em andamento');
  });

  it('customer-ui C49 says Nenhuma ordem vinculada when there is none', async () => {
    const element = await render(aurora, []);

    const empty = element.querySelector('[data-slot="orders-empty"]')!;
    expect(empty.querySelector('strong')?.textContent?.trim()).toBe('Nenhuma ordem vinculada');
    expect(empty.querySelector('p')?.textContent?.trim()).toBe('As ordens de serviço desta embarcação aparecerão aqui.');
    expect(element.querySelector('[data-slot="work-order-row"]')).toBeNull();
  });

  it('work-order-ui C24 Nova ordem opens the drawer with the vessel locked and lists the new order', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render(aurora, []);

    await click(buttonByText('Nova ordem', element));
    const sheet = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    // The drawer of the "Ordens de serviço" list (AD-042).
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Nova ordem de serviço');
    expect(sheet.textContent).toContain('Serviços a realizar');
    expect(sheet.textContent).toContain('Planejamento');
    const vessel = sheet.querySelector<HTMLSelectElement>('#wo-vessel')!;
    expect(vessel.disabled).toBe(true);
    expect(vessel.value).toBe('vessel-1');
    expect(vessel.selectedOptions[0]?.textContent?.trim()).toBe('Santa Maria');
    expect(sheet.querySelector<HTMLInputElement>('#wo-customer')!.value).toBe('Pescados Atlântico');

    await type('#wo-service-name-0', 'Motor');
    await type('#wo-service-description-0', 'Revisão geral do motor');
    await type('#wo-start', '2026-11-10T09:00');
    await type('#wo-end', '2026-11-15T18:00');
    await click(buttonByText('Criar ordem', sheet));

    const post = controller.expectOne('/api/work-orders');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      vesselId: 'vessel-1',
      startDate: new Date(2026, 10, 10, 9, 0).toISOString(),
      endDate: new Date(2026, 10, 15, 18, 0).toISOString(),
      status: 'PENDING',
      services: [{ name: 'Motor', description: 'Revisão geral do motor' }],
    });
    post.flush({ workOrder: {} }, { status: 201, statusText: 'Created' });
    await settle();
    controller.expectOne(page(0)).flush({ workOrders: [workOrder], total: 1 });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem de serviço criada com sucesso', expect.anything());
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
    const rows = element.querySelectorAll('[data-slot="work-order-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].querySelector('a')?.textContent?.trim()).toBe('#5FBE9F04');
  });

  it('customer-ui C51 deletes a work order only after Confirmar and drops the row', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    await click(element.querySelector('[data-slot="work-order-row"] button[aria-label="Excluir"]'));
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.',
    );
    controller.expectNone(`/api/work-orders/${workOrder.id}`);

    await click(buttonByText('Confirmar', confirmation));
    const deletion = controller.expectOne(`/api/work-orders/${workOrder.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    controller.expectOne(page(0)).flush({ workOrders: [], total: 0 });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem de serviço excluída com sucesso', expect.anything());
    expect(element.querySelector('[data-slot="work-order-row"]')).toBeNull();
  });

  it('customer-ui C52 pages the work orders ten at a time', async () => {
    const ten = Array.from({ length: 10 }, (_, index) => ({ ...workOrder, id: `wo-${index}` }));
    const element = await render(aurora, ten, 11);

    expect(element.querySelectorAll('[data-slot="work-order-row"]')).toHaveLength(10);
    const second = [...element.querySelectorAll<HTMLAnchorElement>('t-pagination a')].find(
      (link) => link.textContent?.trim() === '2',
    );
    await click(second);
    controller.expectOne(page(10)).flush({ workOrders: [{ ...workOrder, id: 'wo-10' }], total: 11 });
    await settle();

    expect(element.querySelectorAll('[data-slot="work-order-row"]')).toHaveLength(1);
  });

  it('customer-ui C52 deleting the only order of page 2 goes back to page 1', async () => {
    const ten = Array.from({ length: 10 }, (_, index) => ({ ...workOrder, id: `wo-${index}` }));
    const element = await render(aurora, ten, 11);
    const pager = () => element.querySelector('t-pagination');

    await click([...element.querySelectorAll<HTMLAnchorElement>('t-pagination a')].find((link) => link.textContent?.trim() === '2'));
    controller.expectOne(page(10)).flush({ workOrders: [{ ...workOrder, id: 'wo-10' }], total: 11 });
    await settle();

    await click(element.querySelector('[data-slot="work-order-row"] button[aria-label="Excluir"]'));
    await click(buttonByText('Confirmar', document.querySelector('[data-slot="dialog-content"]')!));
    controller.expectOne('/api/work-orders/wo-10').flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    controller.expectOne(page(0)).flush({ workOrders: ten, total: 10 });
    await settle();

    expect(element.querySelectorAll('[data-slot="work-order-row"]')).toHaveLength(10);
    expect(element.querySelector('[data-slot="orders-empty"]')).toBeNull();
    // Ten WorkOrders fit one page: no pager.
    expect(pager()).toBeNull();
  });

  it('customer-ui C53 the customer panel shows the contact and Ver cliente', async () => {
    const element = await render();

    const panel = element.querySelector<HTMLElement>('aside')!;
    expect(panel.textContent).toContain('CLIENTE RESPONSÁVEL');
    expect(panel.textContent).toContain('PA');
    expect(text(panel, 'h2')).toBe('Pescados Atlântico');
    expect(panel.textContent).toContain('Cliente');
    expect(text(panel, '[data-slot="client-email"]')).toBe('ops@atlantico.test');
    expect(text(panel, '[data-slot="client-phone"]')).toBe('47966665555');
    const link = [...panel.querySelectorAll('a')].find((anchor) => anchor.textContent?.trim() === 'Ver cliente');
    expect(link?.getAttribute('href')).toBe('/customers/c-atl');
    expect(panel.textContent).not.toContain('Ver ordens de serviço');
  });

  it('customer-ui C53 shows Não informado for a missing phone', async () => {
    const element = await render({ ...aurora, customer: { ...atlantic, phone: '' } });
    expect(text(element, 'aside [data-slot="client-phone"]')).toBe('Não informado');
  });

  it('customer-ui C54 a 404 shows Embarcação não encontrada with a link back', async () => {
    const fixture = TestBed.createComponent(VesselDetail);
    fixture.componentRef.setInput('id', 'vessel-1');
    await settle();
    controller
      .expectOne('/api/vessels/vessel-1')
      .flush({ message: 'Vessel not found' }, { status: 404, statusText: 'Not Found' });
    controller.expectOne(page(0)).flush({ workOrders: [], total: 0 });
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    expect(text(element, 'h1')).toBe('Embarcação não encontrada');
    expect(element.textContent).toContain('Esse registro não está disponível na sua organização.');
    const links = [...element.querySelectorAll('a')].filter((link) => link.textContent?.trim() === 'Voltar à frota');
    expect(links.map((link) => link.getAttribute('href'))).toContain('/vessels');
  });

  it('drawer-standard D3 Nova ordem focuses Nome do serviço with the Vessel locked and posts once', async () => {
    const element = await render(aurora, []);
    const open = async () => {
      await click(buttonByText('Nova ordem', element));
      await settle();
      return drawer()!;
    };
    let sheet = await open();

    expect(frameOf(sheet)).toEqual({
      kicker: 'NOVA SOLICITAÇÃO',
      title: 'Nova ordem de serviço',
      description: 'Preencha os dados dos serviços para programar o atendimento da embarcação.',
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
        title: 'Serviços a realizar',
        subtitle: 'Adicione um ou mais serviços para esta embarcação',
        icon: 'lucideWrench',
        labels: ['Nome do serviço *', 'Descrição do serviço *'],
      },
      {
        title: 'Planejamento',
        subtitle: 'Defina o período e o status da ordem',
        icon: 'lucideCalendarDays',
        labels: ['Docagem *', 'Desdocagem *', 'Status'],
      },
    ]);
    // This Vessel, chosen and locked: the first field that takes input is the service's name.
    const vessel = sheet.querySelector<HTMLSelectElement>('#wo-vessel')!;
    expect(vessel.disabled).toBe(true);
    expect(vessel.value).toBe('vessel-1');
    expect(squash(vessel.selectedOptions[0]?.textContent)).toBe('Santa Maria');
    expect(sheet.querySelector<HTMLInputElement>('#wo-customer')!.value).toBe('Pescados Atlântico');
    expect(document.activeElement?.id).toBe('wo-service-name-0');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Criar ordem', type: 'submit', disabled: false },
      more: 0,
    });
    expect(invalidIn(sheet)).toEqual([]);
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);

    // Saved empty: nothing is sent, each required field left empty speaks under itself.
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({
      'wo-vessel': [],
      'wo-customer': [],
      'wo-service-name-0': ['Nome do serviço é obrigatório'],
      'wo-service-description-0': ['Descrição do serviço é obrigatória'],
      'wo-start': ['Data de início é obrigatória'],
      'wo-end': ['Data de fim é obrigatória'],
      'wo-status': [],
    });
    expect(invalidIn(sheet)).toEqual(['wo-service-name-0', 'wo-service-description-0', 'wo-start', 'wo-end']);
    for (const message of [
      'Nome do serviço é obrigatório',
      'Descrição do serviço é obrigatória',
      'Data de início é obrigatória',
      'Data de fim é obrigatória',
    ]) {
      expect(timesIn(sheet, message), message).toBe(1);
    }
    expect(saveButton().disabled).toBe(false);

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);

    // Opened again: clean, with the Vessel still chosen and locked.
    sheet = await open();
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.value).toBe('vessel-1');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-vessel')!.disabled).toBe(true);

    await type('#wo-service-name-0', 'Motor');
    await type('#wo-service-description-0', 'Revisão geral do motor');
    await type('#wo-start', '2026-11-10T09:00');
    await type('#wo-end', '2026-11-15T18:00');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual(saving);

    const post = controller.expectOne({ method: 'POST', url: '/api/work-orders' });
    expect(post.request.body).toEqual({
      vesselId: 'vessel-1',
      startDate: new Date(2026, 10, 10, 9, 0).toISOString(),
      endDate: new Date(2026, 10, 15, 18, 0).toISOString(),
      status: 'PENDING',
      services: [{ name: 'Motor', description: 'Revisão geral do motor' }],
    });
    post.flush({ workOrder }, { status: 201, statusText: 'Created' });
    await settle();
    controller.expectOne({ method: 'GET', url: page(0) }).flush({ workOrders: [workOrder], total: 1 });
    await settle();
    expect(drawer()).toBeNull();
  });

  it('drawer-standard D9 Editar embarcação opens in the standard frame and puts once', async () => {
    const element = await render();
    const open = async () => {
      await click(buttonByText('Editar', element));
      await settle();
      return drawer()!;
    };
    let sheet = await open();

    expect(frameOf(sheet)).toEqual({
      kicker: 'FROTA / EMBARCAÇÕES',
      title: 'Editar embarcação',
      description: 'Atualize as informações cadastrais e operacionais desta embarcação.',
      close: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
    });
    // Today's fields and rules (AD-028): no Customer and no IMO number when editing.
    expect(cardsOf(sheet)).toEqual([
      {
        title: 'Detalhes da embarcação',
        subtitle: 'Informações básicas sobre a embarcação',
        icon: 'lucideShip',
        labels: ['Nome *'],
      },
      {
        title: 'Tipo e comprimento',
        subtitle: 'Identificação e dimensões da embarcação',
        icon: 'lucideRuler',
        labels: ['Tipo de embarcação *', 'Comprimento (m) *'],
      },
    ]);
    expect(sheet.querySelector('#customerId')).toBeNull();
    expect(sheet.querySelector('#imoNumber')).toBeNull();
    expect(document.activeElement?.id).toBe('vessel-name');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Salvar alterações', type: 'submit', disabled: false },
      more: 0,
    });
    expect(invalidIn(sheet)).toEqual([]);

    // Nome and Comprimento cleared: nothing is sent, each speaks under itself.
    await type('#vessel-name', '');
    await type('#length', '');
    await type('#type', 'CARGO');
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({
      'vessel-name': ['Nome é obrigatório'],
      type: [],
      length: ['Comprimento é obrigatório'],
    });
    expect(invalidIn(sheet)).toEqual(['vessel-name', 'length']);
    for (const message of ['Nome é obrigatório', 'Comprimento é obrigatório']) {
      expect(timesIn(sheet, message), message).toBe(1);
    }
    expect(saveButton().disabled).toBe(false);

    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(sent()).toEqual([]);

    // The same Vessel again: its stored values, nothing red.
    sheet = await open();
    expect(sheet.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Santa Maria');
    expect(sheet.querySelector<HTMLSelectElement>('#type')!.value).toBe('FISHING');
    expect(sheet.querySelector<HTMLInputElement>('#length')!.value).toBe('32.5');
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await type('#vessel-name', 'Santa Maria II');
    await type('#length', '33.5');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual(saving);

    // The route the drawer calls today (AC 29): the Vessel under its Customer.
    const put = controller.expectOne({ method: 'PUT', url: '/api/customers/c-atl/vessels/vessel-1' });
    expect(put.request.body).toEqual({ customerId: 'c-atl', name: 'Santa Maria II', type: 'FISHING', length: 33.5 });
    put.flush({ vessel: {} });
    await settle();
    controller
      .expectOne({ method: 'GET', url: '/api/vessels/vessel-1' })
      .flush({ vessel: { ...aurora, name: 'Santa Maria II', length: 33.5 } });
    await settle();
    expect(drawer()).toBeNull();
  });
});
