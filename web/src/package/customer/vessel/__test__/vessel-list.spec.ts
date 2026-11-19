import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { VesselList } from '../vessel-list/vessel-list';

const customers = [
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
];

const aurora = { id: 'v-aur', name: 'Aurora', imoNumber: '9182451', type: 'CARGO', length: 32.5, customerId: 'c-atl', status: 'ACTIVE' };
const lula = { id: 'v-lul', name: 'Lula Branca', imoNumber: '9236178', type: 'FISHING', length: 28, customerId: 'c-atl', status: 'MAINTENANCE' };
const vento = { id: 'v-ven', name: 'Vento Leste', imoNumber: '', type: 'TANKER', length: 26.44, customerId: 'c-mar', status: 'INACTIVE' };

@Component({ template: 'detail' })
class DetailStub {}

describe('VesselList', () => {
  let controller: HttpTestingController;
  let fixture: ComponentFixture<VesselList>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'vessels/:id', component: DetailStub }]),
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

  async function open(vessels: object[] = [vento, aurora, lula], customerList: object[] = customers) {
    fixture = TestBed.createComponent(VesselList);
    element = fixture.nativeElement as HTMLElement;
    await settle();
    const vesselRequest = controller.expectOne('/api/vessels');
    const customerRequest = controller.expectOne('/api/customers');
    vesselRequest.flush({ vessels, total: vessels.length });
    customerRequest.flush({ customers: customerList, total: customerList.length });
    await settle();
    return { vesselRequest, customerRequest };
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

  const byLabel = (label: string) => document.querySelector<HTMLElement>(`[aria-label="${label}"]`);
  const buttonByText = (text: string, root: ParentNode = element) =>
    [...root.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim() === text);
  const rowNames = () =>
    [...element.querySelectorAll('[data-slot="vessel-row"] [data-slot="vessel-name"]')].map((name) => name.textContent?.trim());
  const footer = () => element.querySelector('[data-slot="list-footer"] [data-slot="range"]')?.textContent?.replace(/\s+/g, ' ').trim();
  const search = (value: string) => type('input[aria-label="Buscar embarcação"]', value);
  const drawer = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
  const exportButton = () =>
    [...element.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Exportar'))!;

  const squash = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

  /** A label as it reads: its own text, then " *" only when it carries the required mark. */
  function labelText(label: Element) {
    const copy = label.cloneNode(true) as Element;
    const marks = [...copy.querySelectorAll('[data-slot="required-mark"]')];
    marks.forEach((mark) => mark.remove());
    return `${squash(copy)}${marks.length ? ' *' : ''}`;
  }

  /** A footer button as it reads: its type, its first child, its text and whether it is disabled. */
  function readButton(button: HTMLButtonElement | null | undefined) {
    const first = button?.firstElementChild;
    return {
      type: button?.type,
      first: first ? `${first.tagName.toLowerCase()}[name="${first.getAttribute('name')}"]` : null,
      label: squash(button),
      disabled: button?.disabled,
    };
  }

  /** The frame of the open drawer: header, width, cards with their labels, footer. */
  function readFrame(sheet: HTMLElement) {
    const footer = sheet.querySelector('footer[data-slot="drawer-footer"]');
    return {
      kicker: squash(sheet.querySelector('[data-slot="sheet-kicker"]')),
      title: squash(sheet.querySelector('[data-slot="sheet-title"]')),
      description: squash(sheet.querySelector('[data-slot="sheet-description"]')),
      closeLabel: sheet.querySelector('header button')?.getAttribute('aria-label'),
      widths: sheet.className.split(/\s+/).filter((token) => token.startsWith('sm:max-w-')),
      cards: [...sheet.querySelectorAll('section[data-slot="drawer-card"]')].map((card) => ({
        title: squash(card.querySelector('[data-slot="drawer-card-title"]')),
        subtitle: squash(card.querySelector('[data-slot="drawer-card-subtitle"]')),
        icon: card.querySelector('[data-slot="drawer-card-icon"]')?.getAttribute('data-icon'),
        labels: [...card.querySelectorAll('label')].map(labelText),
      })),
      hint: squash(footer?.querySelector('[data-slot="required-hint"]')),
      buttons: [...(footer?.querySelectorAll<HTMLButtonElement>('button') ?? [])].map(readButton),
    };
  }

  const submitButton = (sheet: HTMLElement) =>
    sheet.querySelector<HTMLButtonElement>('footer[data-slot="drawer-footer"] button[type="submit"]');

  /** The messages shown in the drawer, by the id of the field whose group shows them. */
  function messages(sheet: HTMLElement) {
    const shown: Record<string, string[]> = {};
    for (const group of sheet.querySelectorAll('t-form-group')) {
      const errors = [...group.querySelectorAll('[data-slot="error"]')].map((error) => squash(error) ?? '');
      if (errors.length) shown[group.querySelector('input, select, textarea')?.id ?? 'no field'] = errors;
    }
    return shown;
  }

  const errorCount = (sheet: HTMLElement) => sheet.querySelectorAll('[data-slot="error"], t-input-error').length;
  const invalidFields = (sheet: HTMLElement) => [...sheet.querySelectorAll('[data-invalid]')].map((field) => field.id);
  const pending = () => controller.match(() => true).map(({ request }) => `${request.method} ${request.urlWithParams}`);
  const value = (selector: string) => document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value;

  it('customer-ui C34 requests vessels and customers with no page and shows Total na frota', async () => {
    const { vesselRequest, customerRequest } = await open();

    expect(vesselRequest.request.urlWithParams).toBe('/api/vessels');
    expect(customerRequest.request.urlWithParams).toBe('/api/customers');
    const metrics = [...element.querySelectorAll('[data-slot="metric"]')].map((metric) =>
      metric.textContent?.replace(/\s+/g, ' ').trim(),
    );
    // One vessel of each status (AD-099).
    expect(metrics).toEqual([
      'Total na frota 03 embarcações',
      'Em operação 01 Ativas',
      'Em manutenção 01 Atenção técnica',
      'Fora de operação 01 Inativas',
    ]);
    for (const gone of ['STATUS', 'Todas', 'Frota atualizada']) {
      expect(element.textContent).not.toContain(gone);
    }
    expect(element.textContent).toContain('OPERAÇÃO / FROTA');
    expect(element.textContent).toContain('Gerencie os dados cadastrais da sua frota.');
    expect(element.textContent).not.toContain('acompanhe a situação');
    expect(element.textContent).toContain('Consulte, cadastre e atualize os dados da sua frota.');
    expect(element.querySelector('t-pagination')).toBeNull();
  });

  it('customer-ui C36 sorts by name and shows IMO, type, length and the customer', async () => {
    await open();

    expect(rowNames()).toEqual(['Aurora', 'Lula Branca', 'Vento Leste']);
    const headers = [...element.querySelectorAll('thead th')].map((header) => header.textContent?.trim());
    expect(headers).toEqual(['', 'EMBARCAÇÃO', 'NÚMERO IMO', 'TIPO', 'COMPRIMENTO', 'CLIENTE', 'Ações']);
    const rows = [...element.querySelectorAll<HTMLElement>('[data-slot="vessel-row"]')].map((row) => ({
      checkbox: row.querySelector('input[type="checkbox"]')?.getAttribute('aria-label'),
      // The name is no longer a link: the row opens the Vessel (AD-103).
      links: row.querySelectorAll('a').length,
      imo: row.querySelector('[data-slot="imo"]')?.textContent?.trim(),
      type: row.querySelector('[data-slot="type"]')?.textContent?.trim(),
      length: row.querySelector('[data-slot="length"]')?.textContent?.trim(),
      customer: row.querySelector('[data-slot="customer"]')?.textContent?.trim(),
    }));
    expect(rows).toEqual([
      {
        checkbox: 'Selecionar embarcação Aurora',
        links: 0,
        imo: '9182451',
        type: 'Carga',
        length: '32,5 m',
        customer: 'Pescados Atlântico',
      },
      {
        checkbox: 'Selecionar embarcação Lula Branca',
        links: 0,
        imo: '9236178',
        type: 'Pesca',
        length: '28 m',
        customer: 'Pescados Atlântico',
      },
      {
        checkbox: 'Selecionar embarcação Vento Leste',
        links: 0,
        imo: '—',
        type: 'Tanque',
        length: '26,4 m',
        customer: 'Cooperativa Mar Azul',
      },
    ]);
  });

  it('customer-ui C37 filters by name, customer, IMO and type and Limpar busca empties it', async () => {
    await open();

    await search('aurora');
    expect(rowNames()).toEqual(['Aurora']);
    expect(footer()).toBe('Exibindo 1–1 de 1 embarcações');
    await search('ATLÂNTICO');
    expect(rowNames()).toEqual(['Aurora', 'Lula Branca']);
    await search('9182');
    expect(rowNames()).toEqual(['Aurora']);
    await search('carga');
    expect(rowNames()).toEqual(['Aurora']);
    await search('tanque');
    expect(rowNames()).toEqual(['Vento Leste']);
    await search('nada');
    expect(rowNames()).toEqual([]);
    expect(element.querySelector('[data-slot="empty"]')?.textContent?.trim()).toBe(
      'Nenhuma embarcação corresponde à sua busca.',
    );

    await click(byLabel('Limpar busca'));
    expect(element.querySelector<HTMLInputElement>('input[aria-label="Buscar embarcação"]')!.value).toBe('');
    expect(rowNames()).toHaveLength(3);
    expect(footer()).toBe('Exibindo 1–3 de 3 embarcações');
  });

  it('filters by customer and by type before the search, and the three combine', async () => {
    await open();
    const options = (id: string) =>
      [...element.querySelectorAll<HTMLOptionElement>(`#${id} option`)].map((option) => option.textContent?.trim());

    // The selects come before the search, on the same row.
    const toolbar = element.querySelector('#vessel-customer-filter')!.parentElement!;
    expect([...toolbar.querySelectorAll('select, input')].map((field) => field.id || field.getAttribute('aria-label'))).toEqual([
      'vessel-customer-filter',
      'vessel-type-filter',
      'Buscar embarcação',
    ]);
    expect(options('vessel-customer-filter')).toEqual(['Todos os clientes', 'Cooperativa Mar Azul', 'Pescados Atlântico']);
    expect(options('vessel-type-filter')).toEqual([
      'Todos os tipos',
      'Carga',
      'Tanque',
      'Passageiro',
      'Pesca',
      'Graneleiro',
      'Contêiner',
      'Outro',
    ]);

    await type('#vessel-customer-filter', 'c-atl');
    expect(rowNames()).toEqual(['Aurora', 'Lula Branca']);
    expect(footer()).toBe('Exibindo 1–2 de 2 embarcações');
    await type('#vessel-type-filter', 'FISHING');
    expect(rowNames()).toEqual(['Lula Branca']);
    await search('aurora');
    expect(rowNames()).toEqual([]);
    expect(element.querySelector('[data-slot="empty"]')?.textContent?.trim()).toBe(
      'Nenhuma embarcação corresponde à sua busca.',
    );

    await search('');
    await type('#vessel-customer-filter', '');
    expect(rowNames()).toEqual(['Lula Branca']);
    await type('#vessel-type-filter', 'TANKER');
    expect(rowNames()).toEqual(['Vento Leste']);
    await type('#vessel-type-filter', '');
    expect(rowNames()).toEqual(['Aurora', 'Lula Branca', 'Vento Leste']);
    // The filters never ask the API.
    expect(pending()).toEqual([]);
  });

  it('customer-ui C38 selects every shown row, goes indeterminate and keeps the selection across a search', async () => {
    await open();
    const all = () => byLabel('Selecionar todas as embarcações visíveis') as HTMLInputElement;
    const checked = () =>
      [...element.querySelectorAll<HTMLInputElement>('[data-slot="vessel-row"] input[type="checkbox"]')].map(
        (box) => box.checked,
      );

    await click(byLabel('Selecionar embarcação Aurora'));
    expect(all().indeterminate).toBe(true);
    expect(all().checked).toBe(false);

    await search('atlântico');
    expect(checked()).toEqual([true, false]);
    await click(all());
    expect(checked()).toEqual([true, true]);
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);

    await search('');
    // Vento Leste was hidden when the shown rows were selected.
    expect(checked()).toEqual([true, true, false]);
    expect(all().indeterminate).toBe(true);
    await click(all());
    expect(checked()).toEqual([true, true, true]);
    await click(all());
    expect(checked()).toEqual([false, false, false]);
  });

  it('customer-ui C39 Exportar is disabled with no selection and counts the selection', async () => {
    await open();

    expect(exportButton().disabled).toBe(true);
    expect(exportButton().getAttribute('aria-label')).toBe('Selecione embarcações para exportar');
    expect(exportButton().textContent?.trim()).toBe('Exportar');

    await click(byLabel('Selecionar embarcação Aurora'));
    expect(exportButton().disabled).toBe(false);
    expect(exportButton().textContent?.trim()).toBe('Exportar (1)');
    expect(exportButton().getAttribute('aria-label')).toBe('Exportar 1 embarcação selecionada em CSV');

    await click(byLabel('Selecionar embarcação Lula Branca'));
    expect(exportButton().textContent?.trim()).toBe('Exportar (2)');
    expect(exportButton().getAttribute('aria-label')).toBe('Exportar 2 embarcações selecionadas em CSV');
  });

  it('customer-ui C40 Exportar downloads embarcacoes.csv with every selected vessel, hidden ones included', async () => {
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((value: Blob) => {
      blob = value;
      return 'blob:vessels';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
    await open();

    await click(byLabel('Selecionar embarcação Aurora'));
    await click(byLabel('Selecionar embarcação Vento Leste'));
    await search('aurora');
    await click(exportButton());

    expect(downloads).toEqual(['embarcacoes.csv']);
    // text() would drop the BOM; the file keeps it.
    const content = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob!.arrayBuffer());
    expect(content.split('\r\n')).toEqual([
      '﻿"Embarcação","Número IMO","Tipo","Comprimento (m)","Cliente"',
      '"Aurora","9182451","Carga","32,5","Pescados Atlântico"',
      '"Vento Leste","","Tanque","26,4","Cooperativa Mar Azul"',
    ]);
  });

  it('customer-ui C41 Nova embarcação lists every customer and Salvar embarcação posts the vessel', async () => {
    const success = vi.spyOn(toast, 'success');
    const many = Array.from({ length: 11 }, (_, index) => ({
      ...customers[0],
      id: `c${index + 1}`,
      name: `Cliente ${String(index + 1).padStart(2, '0')}`,
    }));
    await open([aurora], many);
    // A filter that hides every row, cleared by the create below.
    await type('#vessel-type-filter', 'TANKER');
    expect(rowNames()).toEqual([]);

    await click(buttonByText('Nova embarcação'));
    const sheet = drawer()!;
    expect(sheet.querySelector('[data-slot="sheet-kicker"]')?.textContent?.trim()).toBe('FROTA / EMBARCAÇÕES');
    expect(sheet.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Nova embarcação');
    expect(sheet.textContent).toContain('Preencha os dados abaixo para registrar uma embarcação na frota.');
    // The "Operação" card holds the status alone, "Ativa" first (AD-099).
    expect(sheet.textContent).toContain('Operação');
    expect(sheet.textContent).not.toContain('Porto base');
    const status = sheet.querySelector<HTMLSelectElement>('#vessel-status')!;
    expect(status.value).toBe('ACTIVE');
    expect([...status.options].map((option) => option.textContent?.trim())).toEqual(['Ativa', 'Em manutenção', 'Inativa']);
    expect(sheet.querySelector('label[for="customerId"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Cliente responsável *',
    );
    expect(sheet.querySelector('label[for="imoNumber"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Número IMO *');
    const options = [...sheet.querySelectorAll<HTMLOptionElement>('select#customerId option')].map((option) =>
      option.textContent?.trim(),
    );
    expect(options).toHaveLength(12);
    expect(options[0]).toBe('Selecione o cliente');
    expect(options[11]).toBe('Cliente 11');

    await type('#vessel-name', 'Maré Alta');
    await type('#customerId', 'c11');
    await type('#imoNumber', '9073412');
    await type('#type', 'FISHING');
    await type('#length', '24.8');
    await type('#vessel-status', 'MAINTENANCE');
    await click(buttonByText('Criar embarcação', sheet));

    const post = controller.expectOne('/api/vessels');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      name: 'Maré Alta',
      customerId: 'c11',
      imoNumber: '9073412',
      type: 'FISHING',
      length: 24.8,
      status: 'MAINTENANCE',
    });
    post.flush({ vessel: {} });
    await settle();
    controller.expectOne('/api/vessels').flush({
      vessels: [aurora, { ...aurora, id: 'v-mar', name: 'Maré Alta', customerId: 'c11' }],
      total: 2,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação criada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(element.querySelector<HTMLSelectElement>('#vessel-type-filter')!.value).toBe('');
    expect(rowNames()).toEqual(['Aurora', 'Maré Alta']);

    // Cancelar and Fechar formulário close without a request.
    await click(buttonByText('Nova embarcação'));
    await click(buttonByText('Cancelar', drawer()!));
    expect(drawer()).toBeNull();
    await click(buttonByText('Nova embarcação'));
    await click(drawer()!.querySelector('[aria-label="Fechar formulário"]'));
    expect(drawer()).toBeNull();
  });

  it('customer-ui C42 Editar embarcação opens the values without customer and IMO and puts the change', async () => {
    const success = vi.spyOn(toast, 'success');
    await open();

    await click(byLabel('Editar embarcação Aurora'));
    const sheet = drawer()!;
    expect(sheet.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Editar embarcação');
    expect(sheet.textContent).toContain('Atualize as informações cadastrais e operacionais desta embarcação.');
    expect(sheet.querySelector('#customerId')).toBeNull();
    expect(sheet.querySelector('#imoNumber')).toBeNull();
    expect(sheet.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Aurora');
    expect(sheet.querySelector<HTMLSelectElement>('#type')!.value).toBe('CARGO');
    expect(sheet.querySelector<HTMLInputElement>('#length')!.value).toBe('32.5');
    expect(sheet.querySelector<HTMLSelectElement>('#vessel-status')!.value).toBe('ACTIVE');

    // What is typed and cancelled never comes back on the next Editar.
    await type('#vessel-name', 'Digitado e cancelado');
    await click(buttonByText('Cancelar', sheet));
    await click(byLabel('Editar embarcação Aurora'));
    expect(drawer()!.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Aurora');
    expect(drawer()!.querySelector<HTMLInputElement>('#length')!.value).toBe('32.5');

    await type('#vessel-name', 'Aurora II');
    await type('#length', '33');
    await type('#vessel-status', 'INACTIVE');
    await click(buttonByText('Salvar alterações', drawer()!));

    const put = controller.expectOne('/api/customers/c-atl/vessels/v-aur');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ customerId: 'c-atl', name: 'Aurora II', type: 'CARGO', length: 33, status: 'INACTIVE' });
    put.flush({ vessel: {} });
    await settle();
    controller.expectOne('/api/vessels').flush({
      vessels: [{ ...aurora, name: 'Aurora II', length: 33 }, lula, vento],
      total: 3,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(rowNames()).toEqual(['Aurora II', 'Lula Branca', 'Vento Leste']);
    expect(element.querySelector('[data-slot="vessel-row"] [data-slot="length"]')?.textContent?.trim()).toBe('33 m');
  });

  it('customer-ui C43 Excluir embarcação deletes after the confirmation and drops the row and its selection', async () => {
    const success = vi.spyOn(toast, 'success');
    await open();

    await click(byLabel('Selecionar embarcação Aurora'));
    await click(byLabel('Selecionar embarcação Lula Branca'));
    await click(byLabel('Excluir embarcação Aurora'));
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir esta embarcação? Esta ação não pode ser desfeita.',
    );
    controller.expectNone('/api/vessels/v-aur');

    await click(buttonByText('Confirmar', confirmation));
    const deletion = controller.expectOne('/api/vessels/v-aur');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    controller.expectOne('/api/vessels').flush({ vessels: [lula, vento], total: 2 });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação excluída com sucesso', expect.anything());
    expect(rowNames()).toEqual(['Lula Branca', 'Vento Leste']);
    expect(exportButton().textContent?.trim()).toBe('Exportar (1)');
  });

  it('customer-ui C44 a 409 keeps the drawer open with the values and toasts the message', async () => {
    const error = vi.spyOn(toast, 'error');
    await open();

    await click(buttonByText('Nova embarcação'));
    await type('#vessel-name', 'Repetida');
    await type('#customerId', 'c-atl');
    await type('#imoNumber', '9182451');
    await type('#type', 'CARGO');
    await type('#length', '10');
    await click(buttonByText('Criar embarcação', drawer()!));
    controller
      .expectOne('/api/vessels')
      .flush({ message: 'Vessel already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao criar embarcação', {
      description: 'Já existe uma embarcação com este número IMO.',
    });
    expect(drawer()).not.toBeNull();
    expect(drawer()!.querySelector<HTMLInputElement>('#vessel-name')!.value).toBe('Repetida');
    expect(drawer()!.querySelector<HTMLInputElement>('#imoNumber')!.value).toBe('9182451');
  });

  it('drawer-standard D7 Nova embarcação opens in the standard frame and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([aurora]);

    await click(buttonByText('Nova embarcação'));
    const sheet = drawer()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'FROTA / EMBARCAÇÕES',
      title: 'Nova embarcação',
      description: 'Preencha os dados abaixo para registrar uma embarcação na frota.',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: [
        {
          title: 'Detalhes da embarcação',
          subtitle: 'Informações básicas sobre a embarcação',
          icon: 'lucideShip',
          labels: ['Nome *', 'Cliente responsável *'],
        },
        {
          title: 'Tipo e comprimento',
          subtitle: 'Identificação e dimensões da embarcação',
          icon: 'lucideRuler',
          labels: ['Número IMO *', 'Tipo de embarcação *', 'Comprimento (m) *'],
        },
        {
          title: 'Operação',
          subtitle: 'Localização e situação atual da frota',
          icon: 'lucideAnchor',
          labels: ['Status'],
        },
      ],
      hint: '* Campos obrigatórios',
      buttons: [
        { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false },
        { type: 'submit', first: 'ng-icon[name="lucideCheck"]', label: 'Criar embarcação', disabled: false },
      ],
    });
    expect(document.activeElement?.id).toBe('vessel-name');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);

    // Saving the empty form sends nothing and speaks under each field.
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({
      'vessel-name': ['Nome é obrigatório'],
      customerId: ['Cliente é obrigatório'],
      imoNumber: ['Número IMO é obrigatório'],
      type: ['Tipo é obrigatório'],
      length: ['Comprimento é obrigatório'],
    });
    expect(errorCount(sheet)).toBe(5);
    expect(invalidFields(sheet)).toEqual(['vessel-name', 'customerId', 'imoNumber', 'type', 'length']);

    // Cancelar closes with no request, and the next opening starts clean.
    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);
    await click(buttonByText('Nova embarcação'));
    expect(messages(drawer()!)).toEqual({});
    expect(errorCount(drawer()!)).toBe(0);
    expect(invalidFields(drawer()!)).toEqual([]);

    await type('#vessel-name', 'Maré Alta');
    await type('#customerId', 'c-atl');
    await type('#imoNumber', '9073412');
    await type('#type', 'FISHING');
    await type('#length', '24.8');
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual({
      type: 'submit',
      first: 'ng-icon[name="lucideLoader2"]',
      label: 'Salvando...',
      disabled: true,
    });
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual(['POST /api/vessels']);
    expect(requests[0].request.body).toEqual({
      name: 'Maré Alta',
      customerId: 'c-atl',
      imoNumber: '9073412',
      type: 'FISHING',
      length: 24.8,
      status: 'ACTIVE',
    });
    requests[0].flush({ vessel: {} });
    await settle();
    controller.expectOne('/api/vessels').flush({
      vessels: [aurora, { ...aurora, id: 'v-mar', name: 'Maré Alta', imoNumber: '9073412' }],
      total: 2,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação criada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);
  });

  it('drawer-standard D8 Editar embarcação opens in the standard frame and puts once', async () => {
    const success = vi.spyOn(toast, 'success');
    await open();

    await click(byLabel('Editar embarcação Aurora'));
    const sheet = drawer()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'FROTA / EMBARCAÇÕES',
      title: 'Editar embarcação',
      description: 'Atualize as informações cadastrais e operacionais desta embarcação.',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: [
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
        {
          title: 'Operação',
          subtitle: 'Localização e situação atual da frota',
          icon: 'lucideAnchor',
          labels: ['Status'],
        },
      ],
      hint: '* Campos obrigatórios',
      buttons: [
        { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false },
        { type: 'submit', first: 'ng-icon[name="lucideCheck"]', label: 'Salvar alterações', disabled: false },
      ],
    });
    expect(sheet.querySelector('#customerId')).toBeNull();
    expect(sheet.querySelector('#imoNumber')).toBeNull();
    expect(sheet.textContent).not.toContain('Cliente responsável');
    expect(sheet.textContent).not.toContain('Número IMO');
    expect(document.activeElement?.id).toBe('vessel-name');
    expect([value('#vessel-name'), value('#type'), value('#length')]).toEqual(['Aurora', 'CARGO', '32.5']);

    // Emptied fields stay quiet until the save button is used, which then sends nothing.
    await type('#vessel-name', '');
    await type('#length', '');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({
      'vessel-name': ['Nome é obrigatório'],
      length: ['Comprimento é obrigatório'],
    });
    expect(errorCount(sheet)).toBe(2);
    expect(invalidFields(sheet)).toEqual(['vessel-name', 'length']);

    // Cancelar closes with no request; the same Vessel opens again with its stored values, clean.
    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);
    await click(byLabel('Editar embarcação Aurora'));
    expect([value('#vessel-name'), value('#type'), value('#length')]).toEqual(['Aurora', 'CARGO', '32.5']);
    expect(messages(drawer()!)).toEqual({});
    expect(errorCount(drawer()!)).toBe(0);
    expect(invalidFields(drawer()!)).toEqual([]);

    await type('#vessel-name', 'Aurora II');
    await type('#type', 'TANKER');
    await type('#length', '33');
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual({
      type: 'submit',
      first: 'ng-icon[name="lucideLoader2"]',
      label: 'Salvando...',
      disabled: true,
    });
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'PUT /api/customers/c-atl/vessels/v-aur',
    ]);
    expect(requests[0].request.body).toEqual({
      customerId: 'c-atl',
      name: 'Aurora II',
      type: 'TANKER',
      length: 33,
      status: 'ACTIVE',
    });
    requests[0].flush({ vessel: {} });
    await settle();
    controller.expectOne('/api/vessels').flush({
      vessels: [{ ...aurora, name: 'Aurora II', type: 'TANKER', length: 33 }, lula, vento],
      total: 3,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);
  });

  it('pages the vessels 10 at a time and a search or a filter goes back to page 1', async () => {
    const boats = Array.from({ length: 12 }, (_, at) => ({
      ...aurora,
      id: `v-${at + 1}`,
      name: `Barco ${String(at + 1).padStart(2, '0')}`,
      imoNumber: String(9000000 + at),
      type: at < 11 ? 'CARGO' : 'FISHING',
    }));
    await open(boats);
    const pager = () => element.querySelector('nav[aria-label="Paginação"]')!;
    const pageButtons = () =>
      [...pager().querySelectorAll<HTMLButtonElement>('button[data-slot="page"]')].map((button) => button.textContent?.trim());
    const goToPage = (number: string) =>
      click([...pager().querySelectorAll<HTMLButtonElement>('button[data-slot="page"]')].find((b) => b.textContent?.trim() === number));
    const current = () => pager().querySelector('[aria-current="page"]')?.textContent?.trim();

    expect(rowNames()).toHaveLength(10);
    expect(footer()).toBe('Exibindo 1–10 de 12 embarcações');
    expect(pageButtons()).toEqual(['1', '2']);

    await goToPage('2');
    expect(rowNames()).toEqual(['Barco 11', 'Barco 12']);
    expect(footer()).toBe('Exibindo 11–12 de 12 embarcações');

    await type('#vessel-type-filter', 'CARGO');
    expect(current()).toBe('1');
    expect(footer()).toBe('Exibindo 1–10 de 11 embarcações');

    await goToPage('2');
    expect(rowNames()).toEqual(['Barco 11']);
    await search('barco 0');
    expect(current()).toBe('1');
    expect(rowNames()).toHaveLength(9);
  });

  it('customer-ui C36 a row opens its vessel except on the checkbox and the actions, which show on hover', async () => {
    await open();
    const router = TestBed.inject(Router);
    const row = (name: string) =>
      [...element.querySelectorAll<HTMLElement>('[data-slot="vessel-row"]')].find(
        (item) => item.querySelector('[data-slot="vessel-name"]')?.textContent?.trim() === name,
      )!;
    const actions = row('Aurora').querySelector<HTMLElement>('[data-slot="row-actions"]')!;

    expect([...actions.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))).toEqual([
      'Editar embarcação Aurora',
      'Excluir embarcação Aurora',
    ]);
    expect(actions.firstElementChild!.classList).toContain('opacity-0');
    expect(actions.firstElementChild!.classList).toContain('group-hover:opacity-100');
    expect(byLabel('Excluir embarcação Aurora')!.classList).toContain('text-destructive');

    await click(byLabel('Selecionar embarcação Aurora'));
    await click(actions);
    expect(router.url).toBe('/');

    await click(row('Lula Branca').querySelector('[data-slot="type"]'));
    expect(router.url).toBe('/vessels/v-lul');
    row('Vento Leste').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    expect(router.url).toBe('/vessels/v-ven');
  });
});
