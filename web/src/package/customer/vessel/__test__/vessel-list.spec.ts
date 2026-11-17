import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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

const aurora = { id: 'v-aur', name: 'Aurora', imoNumber: '9182451', type: 'CARGO', length: 32.5, customerId: 'c-atl' };
const lula = { id: 'v-lul', name: 'Lula Branca', imoNumber: '9236178', type: 'FISHING', length: 28, customerId: 'c-atl' };
const vento = { id: 'v-ven', name: 'Vento Leste', imoNumber: '', type: 'TANKER', length: 26.44, customerId: 'c-mar' };

describe('VesselList', () => {
  let controller: HttpTestingController;
  let fixture: ComponentFixture<VesselList>;
  let element: HTMLElement;

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
    [...element.querySelectorAll('[data-slot="vessel-row"] a')].map((link) => link.textContent?.trim());
  const footer = () => element.querySelector('[data-slot="list-footer"]')?.textContent?.replace(/\s+/g, ' ').trim();
  const search = (value: string) => type('input[aria-label="Buscar embarcação"]', value);
  const drawer = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
  const exportButton = () =>
    [...element.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Exportar'))!;

  it('customer-ui C34 requests vessels and customers with no page and shows Total na frota', async () => {
    const { vesselRequest, customerRequest } = await open();

    expect(vesselRequest.request.urlWithParams).toBe('/api/vessels');
    expect(customerRequest.request.urlWithParams).toBe('/api/customers');
    const values = [...element.querySelectorAll('[data-slot="metric-value"]')].map((value) => value.textContent?.trim());
    expect(values).toEqual(['03']);
    expect(element.textContent).toContain('Total na frota');
    for (const gone of ['Em operação', 'Em manutenção', 'Fora de operação', 'STATUS', 'Todas', 'Frota atualizada']) {
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
      href: row.querySelector('a')?.getAttribute('href'),
      imo: row.querySelector('[data-slot="imo"]')?.textContent?.trim(),
      type: row.querySelector('[data-slot="type"]')?.textContent?.trim(),
      length: row.querySelector('[data-slot="length"]')?.textContent?.trim(),
      customer: row.querySelector('[data-slot="customer"]')?.textContent?.trim(),
    }));
    expect(rows).toEqual([
      {
        checkbox: 'Selecionar embarcação Aurora',
        href: '/vessels/v-aur',
        imo: '9182451',
        type: 'Carga',
        length: '32,5 m',
        customer: 'Pescados Atlântico',
      },
      {
        checkbox: 'Selecionar embarcação Lula Branca',
        href: '/vessels/v-lul',
        imo: '9236178',
        type: 'Pesca',
        length: '28 m',
        customer: 'Pescados Atlântico',
      },
      {
        checkbox: 'Selecionar embarcação Vento Leste',
        href: '/vessels/v-ven',
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
    expect(footer()).toBe('Exibindo 1 de 3 embarcações');
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
    expect(footer()).toBe('Exibindo 3 de 3 embarcações');
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

    await click(buttonByText('Nova embarcação'));
    const sheet = drawer()!;
    expect(sheet.querySelector('[data-slot="sheet-kicker"]')?.textContent?.trim()).toBe('FROTA / EMBARCAÇÕES');
    expect(sheet.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Nova embarcação');
    expect(sheet.textContent).toContain('Preencha os dados abaixo para registrar uma embarcação na frota.');
    expect(sheet.textContent).not.toContain('Operação');
    expect(sheet.textContent).not.toContain('Porto base');
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
    await click(buttonByText('Salvar embarcação', sheet));

    const post = controller.expectOne('/api/vessels');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      name: 'Maré Alta',
      customerId: 'c11',
      imoNumber: '9073412',
      type: 'FISHING',
      length: 24.8,
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

    await type('#vessel-name', 'Aurora II');
    await type('#length', '33');
    await click(buttonByText('Salvar alterações', sheet));

    const put = controller.expectOne('/api/customers/c-atl/vessels/v-aur');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ customerId: 'c-atl', name: 'Aurora II', type: 'CARGO', length: 33 });
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
    await click(buttonByText('Salvar embarcação', drawer()!));
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
});
