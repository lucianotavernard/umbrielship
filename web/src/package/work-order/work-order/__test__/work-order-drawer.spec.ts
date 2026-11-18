import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import {
  buttonByText,
  byLabel,
  click,
  drawer,
  fleet,
  local,
  orderA,
  settle,
  squash,
  type,
  WorkOrderListPage,
} from './work-order-list.harness';
import { WorkOrder } from '../work-order.service';

describe('WorkOrderDrawer', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function openDrawer() {
    const page = await WorkOrderListPage.open();
    await click(buttonByText('Nova ordem de serviço', page.element));
    return page;
  }

  /** Every request still open, as "METHOD url" (match() takes them). */
  const sent = () => controller.match(() => true).map((request) => `${request.request.method} ${request.request.urlWithParams}`);
  const posts = () => controller.match((request) => request.method === 'POST' && request.url === '/api/work-orders');

  const label = (sheet: HTMLElement, id: string) => squash(sheet.querySelector(`label[for="${id}"]`)?.textContent);
  const field = <T extends HTMLElement = HTMLInputElement>(selector: string) => drawer()!.querySelector<T>(selector)!;
  const entries = () => [...drawer()!.querySelectorAll<HTMLElement>('[role="group"][aria-label^="Serviço "]')];
  const entryNames = () =>
    entries().map((entry) => [
      entry.getAttribute('aria-label'),
      entry.querySelector<HTMLInputElement>('input[id^="wo-service-name-"]')!.value,
    ]);
  const removeLabels = () =>
    [...drawer()!.querySelectorAll('button[aria-label^="Remover serviço"]')].map((button) =>
      button.getAttribute('aria-label'),
    );
  /** The messages shown under the field `selector`. */
  const messagesOf = (selector: string) =>
    [...field(selector).closest('t-form-group')!.querySelectorAll('[data-slot="error"]')].map((error) =>
      squash(error.textContent),
    );

  // drawer-standard: what every drawer shows, read the same way in each test (AD-053, AD-056, AD-057).
  const frameOf = (sheet: HTMLElement) => ({
    kicker: squash(sheet.querySelector('[data-slot="sheet-kicker"]')?.textContent),
    title: squash(sheet.querySelector('[data-slot="sheet-title"]')?.textContent),
    description: squash(sheet.querySelector('[data-slot="sheet-description"]')?.textContent),
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
      title: squash(card.querySelector('[data-slot="drawer-card-title"]')?.textContent),
      subtitle: squash(card.querySelector('[data-slot="drawer-card-subtitle"]')?.textContent),
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
    return {
      hint: squash(footer.querySelector('[data-slot="required-hint"]')?.textContent) ?? null,
      cancel: button(cancel),
      save: button(save),
      more: more.length,
    };
  };
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
  /** How many times `text` shows in the drawer: a message under its field and in no list elsewhere. */
  const timesIn = (sheet: HTMLElement, text: string) => (sheet.textContent ?? '').split(text).length - 1;

  async function fillService(index: number, name: string, description: string) {
    await type(`#wo-service-name-${index}`, name);
    await type(`#wo-service-description-${index}`, description);
  }

  /** Lula Branca, two services, 21 to 25 November, in progress. */
  async function fillAll() {
    await type('#wo-vessel', 'v-lul');
    await fillService(0, 'Motor', 'Revisão geral do motor');
    await click(buttonByText('Adicionar serviço', drawer()!));
    await fillService(1, 'Pintura', 'Casco completo');
    await type('#wo-start', '2026-11-21T08:00');
    await type('#wo-end', '2026-11-25T17:30');
    await type('#wo-status', 'IN_PROGRESS');
  }

  it('work-order-ui C18 opens with the vessel, the read-only customer, one service and the planning card', async () => {
    await openDrawer();
    const sheet = drawer()!;

    expect(squash(sheet.querySelector('[data-slot="sheet-title"]')?.textContent)).toBe('Nova ordem de serviço');

    expect(label(sheet, 'wo-vessel')).toBe('Embarcação *');
    const vessel = field<HTMLSelectElement>('#wo-vessel');
    expect([...vessel.options].map((option) => squash(option.textContent))).toEqual([
      'Selecione uma embarcação',
      'Aurora',
      'Estrela do Sul',
      'Lula Branca',
      'Vento Leste',
    ]);
    expect(vessel.value).toBe('');
    expect(vessel.disabled).toBe(false);

    expect(label(sheet, 'wo-customer')).toBe('Cliente responsável');
    const customer = field('#wo-customer');
    expect(customer.readOnly).toBe(true);
    expect(customer.value).toBe('');
    await type('#wo-vessel', 'v-aur');
    expect(field('#wo-customer').value).toBe('Pescados Atlântico');
    await type('#wo-vessel', 'v-ven');
    expect(field('#wo-customer').value).toBe('Cooperativa Mar Azul');
    expect(sheet.textContent).not.toContain('Adicionar cliente');

    expect(sheet.textContent).toContain('Serviços a realizar');
    expect(entries().map((entry) => squash(entry.querySelector('strong')?.textContent))).toEqual(['Serviço 1']);
    expect(label(sheet, 'wo-service-name-0')).toBe('Nome do serviço *');
    expect(label(sheet, 'wo-service-description-0')).toBe('Descrição do serviço *');
    expect(field<HTMLTextAreaElement>('#wo-service-description-0').maxLength).toBe(240);
    expect(!!buttonByText('Adicionar serviço', sheet)).toBe(true);
    expect(removeLabels()).toEqual([]);

    expect(sheet.textContent).toContain('Planejamento');
    expect(sheet.textContent).toContain('Defina o período e o status da ordem');
    expect(label(sheet, 'wo-start')).toBe('Docagem *');
    expect(label(sheet, 'wo-end')).toBe('Desdocagem *');
    expect(label(sheet, 'wo-status')).toBe('Status');
    const status = field<HTMLSelectElement>('#wo-status');
    expect(status.value).toBe('PENDING');
    expect(squash(status.selectedOptions[0]?.textContent)).toBe('Pendente');

    const footer = sheet.querySelector('form > footer')!;
    expect(squash(footer.querySelector('span')?.textContent)).toBe('* Campos obrigatórios');
    expect([...footer.querySelectorAll('button')].map((button) => squash(button.textContent))).toEqual([
      'Cancelar',
      'Criar ordem',
    ]);
  });

  it('work-order-ui C18 adds and removes services, with Remover only from two', async () => {
    await openDrawer();

    await fillService(0, 'Motor', 'Revisão');
    await click(buttonByText('Adicionar serviço', drawer()!));
    expect(entryNames()).toEqual([
      ['Serviço 1', 'Motor'],
      ['Serviço 2', ''],
    ]);
    expect(removeLabels()).toEqual(['Remover serviço 1', 'Remover serviço 2']);

    await fillService(1, 'Pintura', 'Casco');
    await click(buttonByText('Adicionar serviço', drawer()!));
    await fillService(2, 'Leme', 'Ajuste');
    expect(removeLabels()).toEqual(['Remover serviço 1', 'Remover serviço 2', 'Remover serviço 3']);

    await click(byLabel('Remover serviço 2'));
    expect(entryNames()).toEqual([
      ['Serviço 1', 'Motor'],
      ['Serviço 2', 'Leme'],
    ]);
    expect(field<HTMLTextAreaElement>('#wo-service-description-1').value).toBe('Ajuste');

    await click(byLabel('Remover serviço 1'));
    expect(entryNames()).toEqual([['Serviço 1', 'Leme']]);
    expect(removeLabels()).toEqual([]);
    expect(sent()).toEqual([]);
  });

  it('work-order-ui C19 posts the work order with its services once and shows it in the list', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await openDrawer();

    await fillAll();
    await click(buttonByText('Criar ordem', drawer()!));

    // While the request runs the button is disabled: a second use sends nothing.
    const submit = drawer()!.querySelector<HTMLButtonElement>('form > footer button[type="submit"]')!;
    expect(submit.disabled).toBe(true);
    await click(submit);

    // match() takes the requests it returns: one call sees every POST sent so far.
    const all = posts();
    expect(all.length).toBe(1);
    const [post] = all;
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      vesselId: 'v-lul',
      startDate: local(2026, 11, 21, 8, 0),
      endDate: local(2026, 11, 25, 17, 30),
      status: 'IN_PROGRESS',
      services: [
        { name: 'Motor', description: 'Revisão geral do motor' },
        { name: 'Pintura', description: 'Casco completo' },
      ],
    });

    const created: WorkOrder = {
      id: 'ff001122-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      vesselId: 'v-lul',
      startDate: local(2026, 11, 21, 8, 0),
      endDate: local(2026, 11, 25, 17, 30),
      status: 'IN_PROGRESS',
      services: [
        { id: 's1', name: 'Motor', startDate: local(2026, 11, 21, 8, 0), endDate: local(2026, 11, 25, 17, 30), status: 'PENDING' },
        { id: 's2', name: 'Pintura', startDate: local(2026, 11, 21, 8, 0), endDate: local(2026, 11, 25, 17, 30), status: 'PENDING' },
      ],
    };
    post.flush({ workOrder: created }, { status: 201, statusText: 'Created' });
    await settle();
    await page.reload([...fleet, created]);

    expect(success).toHaveBeenCalledWith('Ordem de serviço criada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    const row = page.rowOf('#FF001122')!;
    expect(squash(row.querySelector('a[data-slot="vessel"]')?.textContent)).toBe('Lula Branca');
    expect(squash(row.querySelector('[data-slot="service"]')?.textContent)).toBe('Motor');
    expect(squash(row.querySelector('[data-slot="more-services"]')?.textContent)).toBe('+1 serviço');
    expect(page.codes()[0]).toBe('#FF001122');
  });

  it('work-order-ui C20 sends nothing and shows each required message', async () => {
    const page = await openDrawer();
    const fields: [string, string][] = [
      ['#wo-vessel', 'Embarcação é obrigatória'],
      ['#wo-service-name-0', 'Nome do serviço é obrigatório'],
      ['#wo-service-description-0', 'Descrição do serviço é obrigatória'],
      ['#wo-start', 'Data de início é obrigatória'],
      ['#wo-end', 'Data de fim é obrigatória'],
    ];

    // All empty: every field shows its message.
    await click(buttonByText('Criar ordem', drawer()!));
    expect(sent()).toEqual([]);
    for (const [selector, message] of fields) expect(messagesOf(selector), selector).toEqual([message]);

    // One empty at a time: only that one speaks, and nothing is sent.
    const values: Record<string, string> = {
      '#wo-vessel': 'v-aur',
      '#wo-service-name-0': 'Motor',
      '#wo-service-description-0': 'Revisão',
      '#wo-start': '2026-11-21T08:00',
      '#wo-end': '2026-11-25T17:30',
    };
    for (const [missing, message] of fields) {
      await click(buttonByText('Cancelar', drawer()!));
      await click(buttonByText('Nova ordem de serviço', page.element));
      for (const [selector] of fields) {
        if (selector !== missing) await type(selector, values[selector]);
      }
      await click(buttonByText('Criar ordem', drawer()!));

      expect(sent(), missing).toEqual([]);
      for (const [selector] of fields) {
        expect(messagesOf(selector), `${missing}: ${selector}`).toEqual(selector === missing ? [message] : []);
      }
    }
  });

  it('work-order-ui C23 keeps the drawer and the values when the API fails', async () => {
    const error = vi.spyOn(toast, 'error');
    const success = vi.spyOn(toast, 'success');
    await openDrawer();

    await fillAll();
    await click(buttonByText('Criar ordem', drawer()!));
    const [post] = posts();
    post.flush({ message: 'Vessel not found' }, { status: 404, statusText: 'Not Found' });
    await settle();

    expect(error).toHaveBeenCalledWith(expect.any(String), { description: 'Embarcação não encontrada.' });
    expect(success).not.toHaveBeenCalled();
    expect(drawer()).not.toBeNull();
    expect(field<HTMLSelectElement>('#wo-vessel').value).toBe('v-lul');
    expect(field('#wo-customer').value).toBe('Pescados Atlântico');
    expect(entryNames()).toEqual([
      ['Serviço 1', 'Motor'],
      ['Serviço 2', 'Pintura'],
    ]);
    expect(field<HTMLTextAreaElement>('#wo-service-description-0').value).toBe('Revisão geral do motor');
    expect(field<HTMLTextAreaElement>('#wo-service-description-1').value).toBe('Casco completo');
    expect(field('#wo-start').value).toBe('2026-11-21T08:00');
    expect(field('#wo-end').value).toBe('2026-11-25T17:30');
    expect(field<HTMLSelectElement>('#wo-status').value).toBe('IN_PROGRESS');
    // It can be sent again.
    expect(buttonByText('Criar ordem', drawer()!)!.disabled).toBe(false);
  });

  it('work-order-ui C25 edits dates and status from the row menu with the vessel locked', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await WorkOrderListPage.open();

    const menu = await page.openMenu('#AB12CD34');
    await click(buttonByText('Editar', menu));
    const sheet = drawer()!;

    expect(squash(sheet.querySelector('[data-slot="sheet-title"]')?.textContent)).toBe('Editar ordem de serviço');
    const vessel = field<HTMLSelectElement>('#wo-vessel');
    expect(vessel.disabled).toBe(true);
    expect(vessel.value).toBe('v-aur');
    expect(squash(vessel.selectedOptions[0]?.textContent)).toBe('Aurora');
    expect(sheet.textContent).not.toContain('Serviços a realizar');
    expect(sheet.querySelector('[id^="wo-service-"]')).toBeNull();
    expect(field('#wo-start').value).toBe('2026-11-17T09:12');
    expect(field('#wo-end').value).toBe('2026-11-20T10:00');
    expect(field<HTMLSelectElement>('#wo-status').value).toBe('IN_PROGRESS');
    expect(!!buttonByText('Salvar alterações', sheet)).toBe(true);
    expect(!!buttonByText('Criar ordem', sheet)).toBe(false);

    await type('#wo-end', '2026-11-22T18:00');
    await type('#wo-status', 'COMPLETED');
    await click(buttonByText('Salvar alterações', drawer()!));

    const put = controller.expectOne(`/api/work-orders/${orderA.id}`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 9, 12),
      endDate: local(2026, 11, 22, 18, 0),
      status: 'COMPLETED',
    });
    put.flush(null);
    await settle();
    await page.reload(
      fleet.map((order) =>
        order.id === orderA.id ? { ...order, endDate: local(2026, 11, 22, 18, 0), status: 'COMPLETED' as const } : order,
      ),
    );

    expect(success).toHaveBeenCalledWith('Ordem atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    const row = page.rowOf('#AB12CD34')!;
    expect(squash(row.querySelector('[data-slot="status"]')?.textContent)).toBe('Concluído');
    expect(squash(row.querySelector('[data-slot="prazo"]')?.textContent)).toBe('22 nov, 18:00');
  });

  it('work-order-ui C26 Cancelar, Fechar formulário and Esc close with no request', async () => {
    const page = await openDrawer();

    await type('#wo-vessel', 'v-aur');
    await fillService(0, 'Motor', 'Revisão');
    await click(buttonByText('Cancelar', drawer()!));
    expect(drawer()).toBeNull();

    await click(buttonByText('Nova ordem de serviço', page.element));
    expect(drawer()).not.toBeNull();
    await click(byLabel('Fechar formulário', drawer()!));
    expect(drawer()).toBeNull();

    await click(buttonByText('Nova ordem de serviço', page.element));
    expect(drawer()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(drawer()).toBeNull();

    expect(sent()).toEqual([]);
  });

  it('drawer-standard D1 Nova ordem de serviço keeps the standard frame, focuses Embarcação and posts once', async () => {
    const page = await WorkOrderListPage.open();
    await click(buttonByText('Nova ordem de serviço', page.element));
    await settle();
    let sheet = drawer()!;

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
    expect(document.activeElement?.id).toBe('wo-vessel');
    expect(footerOf(sheet)).toEqual({
      hint: '* Campos obrigatórios',
      cancel: { icon: 'lucideX', text: 'Cancelar', type: 'button', disabled: false },
      save: { icon: 'lucideCheck', text: 'Criar ordem', type: 'submit', disabled: false },
      more: 0,
    });
    // Nothing is red before the first save attempt.
    expect(invalidIn(sheet)).toEqual([]);
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);

    // Saved empty: nothing is sent, and each required field speaks once, under itself.
    await click(saveButton());
    expect(sent()).toEqual([]);
    expect(messagesIn(sheet)).toEqual({
      'wo-vessel': ['Embarcação é obrigatória'],
      'wo-customer': [],
      'wo-service-name-0': ['Nome do serviço é obrigatório'],
      'wo-service-description-0': ['Descrição do serviço é obrigatória'],
      'wo-start': ['Data de início é obrigatória'],
      'wo-end': ['Data de fim é obrigatória'],
      'wo-status': [],
    });
    expect(invalidIn(sheet)).toEqual(['wo-vessel', 'wo-service-name-0', 'wo-service-description-0', 'wo-start', 'wo-end']);
    for (const message of [
      'Embarcação é obrigatória',
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

    // Opened again: clean.
    await click(buttonByText('Nova ordem de serviço', page.element));
    await settle();
    sheet = drawer()!;
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await fillAll();
    await click(saveButton());
    // While the request runs the button is disabled and says so.
    expect(footerOf(drawer()!).save).toEqual({ icon: 'lucideLoader2', text: 'Salvando...', type: 'submit', disabled: true });

    const post = controller.expectOne({ method: 'POST', url: '/api/work-orders' });
    expect(post.request.body).toEqual({
      vesselId: 'v-lul',
      startDate: local(2026, 11, 21, 8, 0),
      endDate: local(2026, 11, 25, 17, 30),
      status: 'IN_PROGRESS',
      services: [
        { name: 'Motor', description: 'Revisão geral do motor' },
        { name: 'Pintura', description: 'Casco completo' },
      ],
    });
    const created: WorkOrder = { ...orderA, id: 'ff001122-5e6f-4a7b-8c9d-0e1f2a3b4c5d', vesselId: 'v-lul' };
    post.flush({ workOrder: created }, { status: 201, statusText: 'Created' });
    await settle();
    await page.reload([...fleet, created]);
    expect(drawer()).toBeNull();
  });

  it('drawer-standard D2 Editar ordem de serviço keeps the standard frame, focuses Docagem and puts once', async () => {
    const page = await WorkOrderListPage.open();
    const openEdit = async () => {
      await click(buttonByText('Editar', await page.openMenu('#AB12CD34')));
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
    expect(field<HTMLSelectElement>('#wo-vessel').disabled).toBe(true);
    expect(field<HTMLSelectElement>('#wo-vessel').value).toBe('v-aur');
    expect(field('#wo-customer').value).toBe('Pescados Atlântico');
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
    expect(field('#wo-start').value).toBe('2026-11-17T09:12');
    expect(field('#wo-end').value).toBe('2026-11-20T10:00');
    expect(field<HTMLSelectElement>('#wo-status').value).toBe('IN_PROGRESS');
    expect(sheet.querySelectorAll('[data-slot="error"]').length).toBe(0);
    expect(invalidIn(sheet)).toEqual([]);

    await type('#wo-end', '2026-11-22T18:00');
    await type('#wo-status', 'COMPLETED');
    await click(saveButton());
    expect(footerOf(drawer()!).save).toEqual({ icon: 'lucideLoader2', text: 'Salvando...', type: 'submit', disabled: true });

    const put = controller.expectOne({ method: 'PUT', url: `/api/work-orders/${orderA.id}` });
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 9, 12),
      endDate: local(2026, 11, 22, 18, 0),
      status: 'COMPLETED',
    });
    put.flush(null);
    await settle();
    await page.reload(
      fleet.map((order) =>
        order.id === orderA.id ? { ...order, endDate: local(2026, 11, 22, 18, 0), status: 'COMPLETED' as const } : order,
      ),
    );
    expect(drawer()).toBeNull();
  });
});
