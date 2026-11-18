import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { CustomerList } from '../customer-list/customer-list';
import { CustomerListItem } from '../customer.service';

let sequence = 0;
function customer(overrides: Partial<CustomerListItem> = {}): CustomerListItem {
  sequence += 1;
  return {
    id: `c${sequence}`,
    name: `Cliente ${sequence}`,
    email: `c${sequence}@x.test`,
    phone: '13999990000',
    address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
    vesselCount: 0,
    ...overrides,
  };
}

describe('CustomerList', () => {
  let controller: HttpTestingController;
  let fixture: ComponentFixture<CustomerList>;
  let element: HTMLElement;

  beforeEach(() => {
    sequence = 0;
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

  async function open(customers: CustomerListItem[]) {
    fixture = TestBed.createComponent(CustomerList);
    element = fixture.nativeElement as HTMLElement;
    await settle();
    const request = controller.expectOne('/api/customers');
    request.flush({ customers, total: customers.length });
    await settle();
    return request;
  }

  async function type(selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  }

  const search = (value: string) => type('input[placeholder="Buscar por nome, contato ou cidade..."]', value);
  const rowNames = () =>
    [...element.querySelectorAll('[data-slot="customer-row"] a[href^="/customers/"]:not([aria-label])')].map(
      (link) => link.textContent?.trim(),
    );
  const metrics = () =>
    [...element.querySelectorAll('[data-slot="metric-value"]')].map((value) => value.textContent?.trim());
  const footer = () => element.querySelector('[data-slot="list-footer"]')?.textContent?.replace(/\s+/g, ' ').trim();
  const byLabel = (label: string) => element.querySelector<HTMLElement>(`[aria-label="${label}"]`);
  const buttonByText = (text: string, root: ParentNode = element) =>
    [...root.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim() === text);
  const dialog = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');

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
  const values = () =>
    ['#name', '#email', '#phone', '#address', '#city', '#state'].map(
      (selector) => dialog()?.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value,
    );

  const customerCards = [
    {
      title: 'Dados do cliente',
      subtitle: 'Identificação e formas de contato',
      icon: 'lucideBuilding2',
      labels: ['Nome do cliente *', 'E-mail *', 'Telefone para contato *'],
    },
    {
      title: 'Endereço',
      subtitle: 'Localização do cliente',
      icon: 'lucideMapPin',
      labels: ['Rua e número *', 'Cidade *', 'Estado (UF) *'],
    },
  ];

  async function click(target: HTMLElement | null | undefined) {
    if (!target) throw new Error('nothing to click');
    target.click();
    await settle();
  }

  it('customer-ui C12 requests GET /api/customers once with no page and shows the new subtitle', async () => {
    const request = await open([customer({ name: 'Atlantic' })]);

    expect(request.request.method).toBe('GET');
    expect(request.request.urlWithParams).toBe('/api/customers');
    expect(element.textContent).toContain('OPERAÇÃO / RELACIONAMENTO');
    expect(element.textContent).toContain('Gerencie os proprietários das embarcações e seus dados de contato.');
    expect(element.textContent).toContain('Lista de clientes');
    expect(element.textContent).toContain('Consulte, cadastre e atualize os clientes da sua organização.');
    expect(element.textContent).not.toContain('Os proprietários são identificados a partir das embarcações cadastradas.');
    expect(element.textContent).not.toContain('Cadastro vinculado à frota');
    expect(element.querySelector('t-pagination')).toBeNull();
  });

  it('customer-ui C15 sorts customers by name in pt-BR', async () => {
    await open([customer({ name: 'Barco Azul' }), customer({ name: 'anchor co' }), customer({ name: 'Ágata Pesca' })]);

    expect(rowNames()).toEqual(['Ágata Pesca', 'anchor co', 'Barco Azul']);
  });

  it('customer-ui C16 counts customers, vessels, emails and phones over every customer', async () => {
    const withPhone = [1, 2, 3].map(() => customer({ phone: '13999990000', vesselCount: 2 }));
    const withoutPhone = [
      customer({ phone: null, vesselCount: 1 }),
      customer({ phone: '', vesselCount: 1 }),
      customer({ phone: '   ', vesselCount: 1 }),
      customer({ phone: null, vesselCount: 1 }),
      customer({ phone: null, vesselCount: 1, name: 'Zeta' }),
    ];
    await open([...withPhone, ...withoutPhone]);

    expect(metrics()).toEqual(['08', '11', '08', '03']);
    expect(element.textContent).toContain('Clientes cadastrados');
    expect(element.textContent).toContain('Embarcações vinculadas');
    expect(element.textContent).toContain('Com e-mail cadastrado');
    expect(element.textContent).toContain('Com telefone cadastrado');

    // The search narrows the rows, never the counts.
    await search('Zeta');
    expect(rowNames()).toEqual(['Zeta']);
    expect(metrics()).toEqual(['08', '11', '08', '03']);

    fixture.destroy();
    await open(Array.from({ length: 120 }, () => customer()));
    expect(metrics()[0]).toBe('120');
  });

  it('customer-ui C17 filters by name, email, phone, city and state without a request', async () => {
    await open([
      customer({
        name: 'Atlântico Pesca',
        email: 'ops@atl.test',
        phone: '13999990000',
        address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
      }),
      customer({
        name: 'Costa Sul',
        email: 'cs@costa.test',
        phone: '',
        address: { address: 'Rua 2', city: 'Itajaí', state: 'SC' },
      }),
      customer({
        name: 'Hispano Naval',
        email: 'h@h.test',
        phone: '',
        address: { address: 'Rua 3', city: 'Rio Grande', state: 'RS' },
      }),
      customer({
        name: 'Maré Alta',
        email: 'mare@x.test',
        phone: '21988887777',
        address: { address: 'Rua 4', city: 'Niterói', state: 'RJ' },
      }),
    ]);

    await search('santos');
    expect(rowNames()).toEqual(['Atlântico Pesca']);
    await search('SP');
    expect(rowNames()).toEqual(['Atlântico Pesca', 'Hispano Naval']);
    expect(footer()).toBe('Exibindo 2 de 4 clientes');
    await search('cs@costa');
    expect(rowNames()).toEqual(['Costa Sul']);
    await search('2198888');
    expect(rowNames()).toEqual(['Maré Alta']);
    await search('ITAJAÍ');
    expect(rowNames()).toEqual(['Costa Sul']);
    await search('rj');
    expect(rowNames()).toEqual(['Maré Alta']);
    await search('');
    expect(rowNames()).toHaveLength(4);
    expect(footer()).toBe('Exibindo 4 de 4 clientes');
    // afterEach verifies that no request left the page while searching.
  });

  it('customer-ui C18 shows each row with the fallbacks of the source', async () => {
    await open([
      customer({
        id: 'full',
        name: 'Pescados Atlântico',
        email: 'ops@atl.test',
        phone: '47966665555',
        address: { address: 'Rua Atlântica, 55', city: 'Itajaí', state: 'SC' },
        vesselCount: 1,
      }),
      customer({
        id: 'empty',
        name: 'Zé',
        email: '',
        phone: null,
        address: { address: '', city: '', state: '' },
        vesselCount: 2,
      }),
    ]);

    const rows = [...element.querySelectorAll<HTMLElement>('[data-slot="customer-row"]')];
    const read = (row: HTMLElement, slot: string) =>
      row.querySelector(`[data-slot="${slot}"]`)?.textContent?.replace(/\s+/g, ' ').trim();

    expect(read(rows[0], 'initials')).toBe('PA');
    expect(rows[0].querySelector('a[href="/customers/full"]')?.textContent?.trim()).toBe('Pescados Atlântico');
    expect(read(rows[0], 'street')).toBe('Rua Atlântica, 55');
    expect(read(rows[0], 'email')).toBe('ops@atl.test');
    expect(read(rows[0], 'phone')).toBe('47966665555');
    expect(read(rows[0], 'location')).toBe('Itajaí, SC');
    expect(read(rows[0], 'vessel-count')).toBe('1 embarcação');

    expect(read(rows[1], 'initials')).toBe('Z');
    expect(read(rows[1], 'street')).toBe('Endereço não informado');
    expect(read(rows[1], 'email')).toBe('E-mail não informado');
    expect(read(rows[1], 'phone')).toBe('Telefone não informado');
    expect(read(rows[1], 'location')).toBe('Localização não informada');
    expect(read(rows[1], 'vessel-count')).toBe('2 embarcações');
  });

  it('customer-ui C19 says Ainda não há clientes cadastrados and Nenhum cliente encontrado para essa busca', async () => {
    await open([]);
    expect(element.querySelector('[data-slot="empty"]')?.textContent?.trim()).toBe(
      'Ainda não há clientes cadastrados.',
    );
    fixture.destroy();

    await open([customer({ name: 'Atlantic' })]);
    await search('nada disso');
    expect(element.querySelector('[data-slot="empty"]')?.textContent?.trim()).toBe(
      'Nenhum cliente encontrado para essa busca.',
    );
  });

  it('customer-ui C20 shows skeleton rows while loading and a toast when the load fails', async () => {
    const error = vi.spyOn(toast, 'error');
    fixture = TestBed.createComponent(CustomerList);
    element = fixture.nativeElement as HTMLElement;
    await settle();

    expect(element.querySelectorAll('[data-slot="skeleton-row"]')).toHaveLength(3);

    controller
      .expectOne('/api/customers')
      .flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    await settle();

    expect(element.querySelectorAll('[data-slot="skeleton-row"]')).toHaveLength(0);
    expect(error).toHaveBeenCalledWith('Erro ao carregar clientes', {
      description: 'Verifique os campos preenchidos.',
    });
  });

  it('customer-ui C21 Novo cliente opens the drawer, Cadastrar cliente posts and shows the customer', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([customer({ name: 'Atlantic' })]);

    await click(buttonByText('Novo cliente'));
    const drawer = dialog()!;
    expect(drawer.querySelector('[data-slot="sheet-kicker"]')?.textContent?.trim()).toBe('RELACIONAMENTO / CLIENTES');
    expect(drawer.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Novo cliente');
    expect(drawer.textContent).toContain('Cadastre os dados de contato do proprietário da embarcação.');
    expect(drawer.textContent).not.toContain('Logo (URL da imagem)');
    expect(drawer.textContent).toContain('* Campos obrigatórios');
    const state = drawer.querySelector<HTMLSelectElement>('select#state')!;
    expect(state.options[0].textContent?.trim()).toBe('Selecione o estado');
    expect([...state.options].map((option) => option.value)).toContain('SP');
    expect(drawer.querySelector('label[for="state"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Estado (UF) *');

    await type('#name', 'Náutica Costa Sul');
    await type('#email', 'contato@costasul.test');
    await type('#phone', '13977776666');
    await type('#address', 'Av. Portuária, 890');
    await type('#city', 'Santos');
    await type('#state', 'SP');
    await click(buttonByText('Criar cliente', drawer));

    const post = controller.expectOne('/api/customers');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      name: 'Náutica Costa Sul',
      email: 'contato@costasul.test',
      phone: '13977776666',
      address: { address: 'Av. Portuária, 890', city: 'Santos', state: 'SP' },
    });
    post.flush({ customer: customer({ name: 'Náutica Costa Sul' }) });
    await settle();

    controller.expectOne('/api/customers').flush({
      customers: [customer({ name: 'Atlantic' }), customer({ name: 'Náutica Costa Sul' })],
      total: 2,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Cliente criado com sucesso', expect.anything());
    expect(dialog()).toBeNull();
    expect(rowNames()).toEqual(['Atlantic', 'Náutica Costa Sul']);
  });

  it('customer-ui C21 Cancelar and Fechar cadastro close the drawer without a request', async () => {
    await open([customer({ name: 'Atlantic' })]);

    await click(buttonByText('Novo cliente'));
    await click(buttonByText('Cancelar', dialog()!));
    expect(dialog()).toBeNull();

    await click(buttonByText('Novo cliente'));
    await click(dialog()!.querySelector<HTMLButtonElement>('[aria-label="Fechar formulário"]'));
    expect(dialog()).toBeNull();
    // afterEach verifies that nothing was posted.
  });

  it('customer-ui C22 Editar opens the Customer\'s values and Salvar alterações puts them', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([
      customer({
        id: 'c-atl',
        name: 'Atlantic',
        email: 'ops@atlantic.test',
        phone: '11999999999',
        address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
      }),
    ]);

    await click(byLabel('Editar Atlantic'));
    const drawer = dialog()!;
    expect(drawer.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Editar cliente');
    const value = (selector: string) => drawer.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!.value;
    expect([value('#name'), value('#email'), value('#phone'), value('#address'), value('#city'), value('#state')]).toEqual([
      'Atlantic',
      'ops@atlantic.test',
      '11999999999',
      'Rua 1',
      'Santos',
      'SP',
    ]);

    // What is typed and cancelled never comes back on the next Editar.
    await type('#name', 'Digitado e cancelado');
    await click(buttonByText('Cancelar', drawer));
    await click(byLabel('Editar Atlantic'));
    expect(dialog()!.querySelector<HTMLInputElement>('#name')!.value).toBe('Atlantic');

    await type('#name', 'Atlantic Pesca');
    await type('#city', 'Guarujá');
    await click(buttonByText('Salvar alterações', dialog()!));

    const put = controller.expectOne('/api/customers/c-atl');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      name: 'Atlantic Pesca',
      email: 'ops@atlantic.test',
      phone: '11999999999',
      address: { address: 'Rua 1', city: 'Guarujá', state: 'SP' },
    });
    put.flush({ customer: {} });
    await settle();
    controller.expectOne('/api/customers').flush({
      customers: [
        customer({
          id: 'c-atl',
          name: 'Atlantic Pesca',
          address: { address: 'Rua 1', city: 'Guarujá', state: 'SP' },
        }),
      ],
      total: 1,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Cliente atualizado com sucesso', {
      description: 'O cliente foi atualizado com sucesso.',
    });
    expect(dialog()).toBeNull();
    expect(rowNames()).toEqual(['Atlantic Pesca']);
    expect(element.textContent).toContain('Guarujá, SP');
  });

  it('customer-ui C23 a 409 keeps the drawer open with the values and toasts the message', async () => {
    const error = vi.spyOn(toast, 'error');
    await open([customer({ id: 'c-atl', name: 'Atlantic' })]);

    await click(buttonByText('Novo cliente'));
    await type('#name', 'Repetido');
    await type('#email', 'ops@atlantic.test');
    await type('#phone', '1');
    await type('#address', 'Rua');
    await type('#city', 'Santos');
    await type('#state', 'SP');
    await click(buttonByText('Criar cliente', dialog()!));
    controller
      .expectOne('/api/customers')
      .flush({ message: 'Customer already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao criar cliente', {
      description: 'Já existe um cliente com este e-mail.',
    });
    expect(dialog()).not.toBeNull();
    expect(dialog()!.querySelector<HTMLInputElement>('#name')!.value).toBe('Repetido');

    await click(buttonByText('Cancelar', dialog()!));
    await click(byLabel('Editar Atlantic'));
    await type('#email', 'outro@x.test');
    await click(buttonByText('Salvar alterações', dialog()!));
    controller
      .expectOne('/api/customers/c-atl')
      .flush({ message: 'Customer already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao atualizar cliente', {
      description: 'Já existe um cliente com este e-mail.',
    });
    expect(dialog()!.querySelector<HTMLInputElement>('#email')!.value).toBe('outro@x.test');
  });

  it('customer-ui C24 Excluir deletes only after the confirmation and drops the row', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([customer({ id: 'c-atl', name: 'Atlantic' }), customer({ name: 'Bravo' })]);

    await click(byLabel('Excluir Atlantic'));
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain('Excluir cliente');
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
    );
    controller.expectNone('/api/customers/c-atl');

    await click(buttonByText('Confirmar', confirmation));
    const deletion = controller.expectOne('/api/customers/c-atl');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    controller.expectOne('/api/customers').flush({ customers: [customer({ name: 'Bravo' })], total: 1 });
    await settle();

    expect(success).toHaveBeenCalledWith('Cliente excluído com sucesso', expect.anything());
    expect(rowNames()).toEqual(['Bravo']);
  });

  it('customer-ui C24 a refused delete keeps the row and toasts the message', async () => {
    const error = vi.spyOn(toast, 'error');
    await open([customer({ id: 'c-atl', name: 'Atlantic' })]);

    await click(byLabel('Excluir Atlantic'));
    await click(buttonByText('Confirmar', document.querySelector('[data-slot="dialog-content"]')!));
    controller
      .expectOne('/api/customers/c-atl')
      .flush({ message: 'Customer in use' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao excluir cliente', {
      description: 'Este cliente possui embarcações e não pode ser excluído.',
    });
    expect(rowNames()).toEqual(['Atlantic']);
  });

  it('customer-ui C25 Ver detalhes links to the customer', async () => {
    await open([customer({ id: 'c-atl', name: 'Atlantic' })]);

    expect(byLabel('Ver detalhes de Atlantic')?.getAttribute('href')).toBe('/customers/c-atl');
  });

  it('drawer-standard D10 Novo cliente opens with the Dados do cliente and Endereço cards and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([customer({ name: 'Atlantic' })]);

    await click(buttonByText('Novo cliente'));
    const sheet = dialog()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'RELACIONAMENTO / CLIENTES',
      title: 'Novo cliente',
      description: 'Cadastre os dados de contato do proprietário da embarcação.',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: customerCards,
      hint: '* Campos obrigatórios',
      buttons: [
        { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false },
        { type: 'submit', first: 'ng-icon[name="lucideCheck"]', label: 'Criar cliente', disabled: false },
      ],
    });
    // The header at the reference's size, not the compact one.
    expect(sheet.querySelector('[data-slot="sheet-title"]')?.classList).toContain('text-[20px]');
    expect(sheet.textContent).not.toContain('Campos com * são obrigatórios');
    expect(document.activeElement?.id).toBe('name');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);

    // Saving the empty form sends nothing and speaks under each field.
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({
      name: ['Nome é obrigatório'],
      email: ['E-mail é obrigatório'],
      phone: ['Telefone é obrigatório'],
      address: ['Endereço é obrigatório'],
      city: ['Cidade é obrigatório'],
      state: ['Estado é obrigatório'],
    });
    expect(errorCount(sheet)).toBe(6);
    expect(invalidFields(sheet)).toEqual(['name', 'email', 'phone', 'address', 'city', 'state']);

    // Cancelar closes with no request, and the next opening starts clean.
    await click(buttonByText('Cancelar', sheet));
    expect(dialog()).toBeNull();
    expect(pending()).toEqual([]);
    await click(buttonByText('Novo cliente'));
    expect(values()).toEqual(['', '', '', '', '', '']);
    expect(messages(dialog()!)).toEqual({});
    expect(errorCount(dialog()!)).toBe(0);
    expect(invalidFields(dialog()!)).toEqual([]);

    await type('#name', 'Náutica Costa Sul');
    await type('#email', 'contato@costasul.test');
    await type('#phone', '13977776666');
    await type('#address', 'Av. Portuária, 890');
    await type('#city', 'Santos');
    await type('#state', 'SP');
    await click(submitButton(dialog()!));

    expect(readButton(submitButton(dialog()!))).toEqual({
      type: 'submit',
      first: 'ng-icon[name="lucideLoader2"]',
      label: 'Salvando...',
      disabled: true,
    });
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual(['POST /api/customers']);
    expect(requests[0].request.body).toEqual({
      name: 'Náutica Costa Sul',
      email: 'contato@costasul.test',
      phone: '13977776666',
      address: { address: 'Av. Portuária, 890', city: 'Santos', state: 'SP' },
    });
    requests[0].flush({ customer: customer({ name: 'Náutica Costa Sul' }) });
    await settle();
    controller.expectOne('/api/customers').flush({
      customers: [customer({ name: 'Atlantic' }), customer({ name: 'Náutica Costa Sul' })],
      total: 2,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Cliente criado com sucesso', expect.anything());
    expect(dialog()).toBeNull();
    expect(pending()).toEqual([]);
  });

  it('drawer-standard D11 Editar cliente reopens clean on the same customer and puts once', async () => {
    const success = vi.spyOn(toast, 'success');
    await open([
      customer({
        id: 'c-atl',
        name: 'Atlantic',
        email: 'ops@atlantic.test',
        phone: '11999999999',
        address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
      }),
      customer({ name: 'Bravo' }),
    ]);

    await click(byLabel('Editar Atlantic'));
    const sheet = dialog()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'RELACIONAMENTO / CLIENTES',
      title: 'Editar cliente',
      description: 'Cadastre os dados de contato do proprietário da embarcação.',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: customerCards,
      hint: '* Campos obrigatórios',
      buttons: [
        { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false },
        { type: 'submit', first: 'ng-icon[name="lucideCheck"]', label: 'Salvar alterações', disabled: false },
      ],
    });
    expect(document.activeElement?.id).toBe('name');
    expect(values()).toEqual(['Atlantic', 'ops@atlantic.test', '11999999999', 'Rua 1', 'Santos', 'SP']);

    // Typed invalid values stay quiet until the save button is used, which then sends nothing.
    await type('#name', '');
    await type('#email', 'ana@');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({ name: ['Nome é obrigatório'], email: ['E-mail inválido'] });
    expect(errorCount(sheet)).toBe(2);
    expect(invalidFields(sheet)).toEqual(['name', 'email']);

    // Cancelar closes with no request; the same Customer opens again with its stored values, clean.
    await click(buttonByText('Cancelar', sheet));
    expect(dialog()).toBeNull();
    expect(pending()).toEqual([]);
    await click(byLabel('Editar Atlantic'));
    expect(values()).toEqual(['Atlantic', 'ops@atlantic.test', '11999999999', 'Rua 1', 'Santos', 'SP']);
    expect(messages(dialog()!)).toEqual({});
    expect(errorCount(dialog()!)).toBe(0);
    expect(invalidFields(dialog()!)).toEqual([]);

    await type('#name', 'Atlantic Pesca');
    await type('#city', 'Guarujá');
    await click(submitButton(dialog()!));

    expect(readButton(submitButton(dialog()!))).toEqual({
      type: 'submit',
      first: 'ng-icon[name="lucideLoader2"]',
      label: 'Salvando...',
      disabled: true,
    });
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'PUT /api/customers/c-atl',
    ]);
    expect(requests[0].request.body).toEqual({
      name: 'Atlantic Pesca',
      email: 'ops@atlantic.test',
      phone: '11999999999',
      address: { address: 'Rua 1', city: 'Guarujá', state: 'SP' },
    });
    requests[0].flush({ customer: {} });
    await settle();
    controller.expectOne('/api/customers').flush({
      customers: [
        customer({ id: 'c-atl', name: 'Atlantic Pesca', address: { address: 'Rua 1', city: 'Guarujá', state: 'SP' } }),
        customer({ name: 'Bravo' }),
      ],
      total: 2,
    });
    await settle();

    expect(success).toHaveBeenCalledWith('Cliente atualizado com sucesso', expect.anything());
    expect(dialog()).toBeNull();
    expect(pending()).toEqual([]);
  });
});
