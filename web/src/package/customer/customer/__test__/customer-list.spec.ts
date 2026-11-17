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
    expect(drawer.textContent).toContain('Campos com * são obrigatórios');
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
    await click(buttonByText('Cadastrar cliente', drawer));

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
    await click(dialog()!.querySelector<HTMLButtonElement>('[aria-label="Fechar cadastro"]'));
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
    await click(buttonByText('Cadastrar cliente', dialog()!));
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
});
