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
    await type('#vessel-name', 'Santa Maria II');
    await type('#length', '33.5');
    await click(buttonByText('Salvar alterações', sheet));

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
    const element = await render();

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

  it('customer-ui C50 Nova ordem posts the work order and lists it', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render(aurora, []);

    await click(buttonByText('Nova ordem', element));
    const sheet = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    await type('#wo-start', '2026-11-10T09:00');
    await type('#wo-end', '2026-11-15T18:00');
    await type('#wo-status', 'PENDING');
    await click(buttonByText('Salvar', sheet));

    const post = controller.expectOne('/api/work-orders');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toMatchObject({ vesselId: 'vessel-1', status: 'PENDING' });
    post.flush({ workOrder: {} });
    await settle();
    controller.expectOne(page(0)).flush({ workOrders: [workOrder], total: 1 });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem de serviço criada com sucesso', expect.anything());
    expect(element.querySelectorAll('[data-slot="work-order-row"]')).toHaveLength(1);
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
});
