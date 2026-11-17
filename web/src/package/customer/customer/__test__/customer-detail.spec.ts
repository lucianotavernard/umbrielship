import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, withRouterResources } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { CustomerDetail } from '../customer-detail/customer-detail';
import { customerDetailResources } from '../customer-detail/customer-detail.resources';

const atlantic = {
  id: 'c1',
  name: 'Pescados Atlântico',
  email: 'ops@atlantico.test',
  phone: '47966665555',
  address: { address: 'Rua Atlântica, 55', city: 'Itajaí', state: 'SC' },
};

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'c1',
};

const lula = { ...aurora, id: 'vessel-2', imoNumber: '9236178', name: 'Lula Branca', type: 'FISHING' };

describe('CustomerDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [{ path: 'customers/:id', component: CustomerDetail, resources: customerDetailResources }],
          withComponentInputBinding(),
          withRouterResources(),
        ),
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

  async function render(customer: object = atlantic, vessels: object[] = [aurora]) {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/customers/c1', CustomerDetail);
    await settle();
    controller.expectOne('/api/customers/c1').flush({ customer });
    await navigation;
    await settle();
    const request = controller.expectOne('/api/vessels?customerId=c1');
    request.flush({ vessels, total: vessels.length });
    await settle();
    return { element: harness.routeNativeElement as HTMLElement, request };
  }

  const text = (element: ParentNode, selector: string) =>
    element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  it('customer-ui C27 requests the vessels with no page and shows the profile without Editar, Nova embarcação or map', async () => {
    const { element, request } = await render();

    expect(request.request.urlWithParams).toBe('/api/vessels?customerId=c1');
    expect(element.textContent).toContain('CADASTRO DE CLIENTE');
    expect(element.textContent).not.toContain('PROPRIETÁRIO DA FROTA');
    expect(text(element, 'h1')).toBe('Pescados Atlântico');
    expect(text(element, '[data-slot="owner-sentence"]')).toBe('Proprietário de 1 embarcação na frota.');
    expect(element.textContent).toContain('Proprietário');
    const buttons = [...element.querySelectorAll('button')].map((button) => button.textContent?.trim());
    expect(buttons).not.toContain('Editar');
    expect(buttons).not.toContain('Nova embarcação');
    expect(element.querySelector('iframe')).toBeNull();
  });

  it('customer-ui C28 the breadcrumb links Clientes and names the customer', async () => {
    const { element } = await render();

    const breadcrumb = element.querySelector('nav[aria-label="Navegação estrutural"]')!;
    const link = breadcrumb.querySelector('a')!;
    expect(link.textContent?.trim()).toBe('Clientes');
    expect(link.getAttribute('href')).toBe('/customers');
    expect([...breadcrumb.children].map((part) => part.textContent?.trim())).toEqual([
      'Clientes',
      '/',
      'Pescados Atlântico',
    ]);
  });

  it('customer-ui C29 shows the contact, the address and the location', async () => {
    const { element } = await render();

    expect(element.textContent).toContain('Contato e endereço');
    expect(text(element, '[data-slot="contact-email"] dd')).toBe('ops@atlantico.test');
    expect(text(element, '[data-slot="contact-phone"] dd')).toBe('47966665555');
    expect(text(element, '[data-slot="contact-address"] dd')).toBe('Rua Atlântica, 55, Itajaí, SC');
    expect(element.textContent).toContain('Localização');
    expect(text(element, '[data-slot="location-city"]')).toBe('Itajaí, SC');
    expect(text(element, '[data-slot="location-street"]')).toBe('Rua Atlântica, 55');
    expect(text(element, '[data-slot="location-region"]')).toBe('Itajaí — SC');
  });

  it('customer-ui C29 shows Não informado for a missing phone', async () => {
    const { element } = await render({ ...atlantic, phone: '' });

    expect(text(element, '[data-slot="contact-phone"] dd')).toBe('Não informado');
  });

  it('customer-ui C30 lists every vessel with its type and links it', async () => {
    const { element } = await render(atlantic, [aurora, lula]);

    expect(text(element, '[data-slot="vessel-total"]')).toBe('2');
    expect(text(element, '[data-slot="owner-sentence"]')).toBe('Proprietário de 2 embarcações na frota.');
    const rows = [...element.querySelectorAll('[data-slot="vessel-row"]')].map((row) => ({
      href: row.querySelector('a')?.getAttribute('href'),
      name: row.querySelector('strong')?.textContent?.trim(),
      type: row.querySelector('small')?.textContent?.trim(),
    }));
    expect(rows).toEqual([
      { href: '/vessels/vessel-1', name: 'Aurora', type: 'Carga' },
      { href: '/vessels/vessel-2', name: 'Lula Branca', type: 'Pesca' },
    ]);
  });

  it('customer-ui C30 says Nenhuma embarcação vinculada a este cliente', async () => {
    const { element } = await render(atlantic, []);

    expect(text(element, '[data-slot="vessels-empty"]')).toBe('Nenhuma embarcação vinculada a este cliente.');
    expect(text(element, '[data-slot="vessel-total"]')).toBe('0');
    expect(text(element, '[data-slot="owner-sentence"]')).toBe('Proprietário de 0 embarcações na frota.');
  });

  it('customer-ui C31 Excluir deletes the vessel after the confirmation and lowers the count', async () => {
    const success = vi.spyOn(toast, 'success');
    const { element } = await render(atlantic, [aurora, lula]);

    element.querySelector<HTMLButtonElement>('[aria-label="Excluir Aurora"]')!.click();
    await settle();
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir esta embarcação? Esta ação não pode ser desfeita.',
    );
    controller.expectNone('/api/vessels/vessel-1');

    [...confirmation.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Confirmar')!.click();
    await settle();
    const deletion = controller.expectOne('/api/vessels/vessel-1');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    controller.expectOne('/api/vessels?customerId=c1').flush({ vessels: [lula], total: 1 });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação excluída com sucesso', expect.anything());
    expect(element.querySelectorAll('[data-slot="vessel-row"]')).toHaveLength(1);
    expect(text(element, '[data-slot="vessel-total"]')).toBe('1');
    expect(text(element, '[data-slot="owner-sentence"]')).toBe('Proprietário de 1 embarcação na frota.');
  });

  it('customer-ui C32 a 404 shows Cliente não encontrado with a link back', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/customers/c1', CustomerDetail);
    await settle();
    controller
      .expectOne('/api/customers/c1')
      .flush({ message: 'Customer not found' }, { status: 404, statusText: 'Not Found' });
    await navigation;
    await settle();

    const element = harness.routeNativeElement as HTMLElement;
    expect(text(element, 'h1')).toBe('Cliente não encontrado');
    expect(element.textContent).toContain('Este cadastro não está disponível na lista de clientes.');
    const back = [...element.querySelectorAll('a')].find((link) => link.textContent?.trim() === 'Voltar para clientes');
    expect(back?.getAttribute('href')).toBe('/customers');
    // A Customer that is not there has no Vessels to ask for.
    controller.expectNone((request) => request.url.startsWith('/api/vessels'));
  });
});
