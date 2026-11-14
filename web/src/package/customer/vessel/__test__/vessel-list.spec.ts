import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { VesselList } from '../vessel-list/vessel-list';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'customer-1',
};

const atlantic = {
  id: 'customer-1',
  name: 'Atlantic',
  email: 'ops@atlantic.test',
  phone: null,
  address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
};

describe('VesselList', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => controller.verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  function fill(element: ParentNode, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function dialogs(element: ParentNode) {
    return [...element.querySelectorAll('[role="dialog"]')];
  }

  async function render(vessels: unknown[] = [aurora], customers: unknown[] = []) {
    const fixture = TestBed.createComponent(VesselList);
    await settle();
    const request = controller.expectOne('/api/vessels?page=1');
    expect(request.request.url).not.toContain('organizationId');
    request.flush({ vessels, total: vessels.length });
    controller.expectOne('/api/customers?page=1').flush({ customers, total: customers.length });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  it('[C91] requests page 1 with no organizationId and renders Aurora', async () => {
    const element = await render();

    expect(element.textContent).toContain('Aurora');
    expect(element.textContent).toContain('Carga');
    expect(element.textContent).toContain('12 metros');
  });

  it('[C91] an empty vessel list says Nenhuma embarcação encontrada', async () => {
    const element = await render([]);

    expect(element.textContent).toContain('Nenhuma embarcação encontrada');
  });

  it('posts the vessel body and requests the list again', async () => {
    const element = await render([], [atlantic]);

    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Nova Embarcação'))?.click();
    await settle();
    fill(element, '#vessel-name', 'Aurora');
    fill(element, '#customerId', 'customer-1');
    fill(element, '#imoNumber', '9074729');
    fill(element, '#type', 'CARGO');
    fill(element, '#length', '12');
    element.querySelector('#vessel-name')?.closest('form')?.requestSubmit();
    await settle();

    const created = controller.expectOne('/api/vessels');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Aurora',
      customerId: 'customer-1',
      imoNumber: '9074729',
      type: 'CARGO',
      length: 12,
    });
    created.flush({ vessel: aurora });
    await settle();
    controller.expectOne('/api/vessels?page=1').flush({ vessels: [aurora], total: 1 });
  });

  it('[C93] delete calls DELETE only after Confirmar and does not read work orders', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    expect(dialogs(element).map((dialog) => dialog.querySelector('h2')?.textContent?.trim())).toEqual([
      'Excluir embarcação',
    ]);
    expect(element.textContent).toContain(
      'Tem certeza que deseja excluir esta embarcação? Esta ação não pode ser desfeita.',
    );
    expect(element.textContent).not.toContain('ordem de serviço');

    [...dialogs(element)[0].querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Cancelar')
      ?.click();
    await settle();
    expect(dialogs(element)).toEqual([]);
    controller.expectNone((request) => request.method === 'DELETE');

    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    [...dialogs(element)[0].querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Confirmar')
      ?.click();
    const deleted = controller.expectOne('/api/vessels/vessel-1');
    expect(deleted.request.method).toBe('DELETE');
    controller.expectNone((request) => request.url.includes('/api/work-orders'));
    deleted.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação excluída com sucesso', {
      description: 'A embarcação foi excluída com sucesso.',
    });
    controller.expectOne('/api/vessels?page=1').flush({ vessels: [], total: 0 });
    await settle();
    expect(dialogs(element)).toEqual([]);
  });
});
