import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding, withRouterResources } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { toast } from '../../../shared/components/ui/toaster';
import { CustomerDetail } from '../customer-detail/customer-detail';
import { customerDetailResources } from '../customer-detail/customer-detail.resources';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({ template: 'Página não encontrada' })
class NotFoundStub {}

const customer = {
  id: 'c1',
  name: 'Atlantic',
  email: 'ops@atlantic.test',
  phone: '11999999999',
  address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
};

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'c1',
};

describe('CustomerDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [
            { path: 'customers/:id', component: CustomerDetail, resources: customerDetailResources },
            { path: '404', component: NotFoundStub },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
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

  async function render(vessels = [aurora], total = vessels.length) {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/customers/c1', CustomerDetail);
    await settle();
    expect(harness.routeNativeElement?.querySelector('customer-detail')).toBeFalsy();
    controller.expectOne('/api/customers/c1').flush({ customer });
    await navigation;
    await settle();
    controller.expectOne('/api/vessels?customerId=c1&page=1').flush({ vessels, total });
    await settle();
    return harness.routeNativeElement as HTMLElement;
  }

  it('shows the customer, the address and the vessels of that customer', async () => {
    const element = await render();

    expect(element.textContent).toContain('Atlantic');
    expect(element.textContent).toContain('ops@atlantic.test');
    expect(element.textContent).toContain('(11) 9 9999-9999');
    expect(element.textContent).toContain('Rua 1');
    expect(element.textContent).toContain('Santos');
    expect(element.textContent).toContain('Aurora');
    expect(element.querySelector('a[href="mailto:ops@atlantic.test"]')).toBeTruthy();
    expect(element.querySelector('a[routerlink="/customers"], a[href="/customers"]')).toBeTruthy();
  });

  it('redirects to /404 when the customer answers 404', async () => {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl('/customers/missing');
    await settle();
    controller
      .expectOne('/api/customers/missing')
      .flush({ message: 'Customer not found' }, { status: 404, statusText: 'Not Found' });
    await navigation;
    await settle();

    expect(TestBed.inject(Router).url).toBe('/404');
    expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
    expect(harness.routeNativeElement?.textContent).not.toContain('Embarcações');
  });

  it('says Nenhuma embarcação encontrada when the customer has none', async () => {
    const element = await render([], 0);

    expect(element.textContent).toContain('Nenhuma embarcação encontrada');
  });

  it('requests the next page of vessels', async () => {
    const element = await render([aurora], 11);

    [...element.querySelectorAll<HTMLElement>('a, button')]
      .find((item) => item.textContent?.trim() === '2')
      ?.click();
    await settle();
    const second = controller.expectOne('/api/vessels?customerId=c1&page=2');
    expect(second.request.url).not.toContain('organizationId');
    second.flush({ vessels: [], total: 11 });
  });

  it('creates a vessel for this customer', async () => {
    const element = await render([], 0);

    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Nova Embarcação'))?.click();
    await settle();
    expect(element.querySelector('#customerId')).toBeNull();
    fill(element, '#vessel-name', 'Aurora');
    fill(element, '#imoNumber', '9074729');
    fill(element, '#type', 'CARGO');
    fill(element, '#length', '12');
    element.querySelector('#vessel-name')?.closest('form')?.requestSubmit();
    await settle();

    const created = controller.expectOne('/api/vessels');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Aurora',
      customerId: 'c1',
      imoNumber: '9074729',
      type: 'CARGO',
      length: 12,
    });
    created.flush({ vessel: aurora });
    await settle();
    controller.expectOne('/api/vessels?customerId=c1&page=1').flush({ vessels: [aurora], total: 1 });
  });

  it('deletes a vessel only after Confirmar', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    expect(element.textContent).toContain('Excluir embarcação');
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Cancelar')?.click();
    await settle();
    controller.expectNone((request) => request.method === 'DELETE');

    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Confirmar')?.click();
    const deleted = controller.expectOne('/api/vessels/vessel-1');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Embarcação excluída com sucesso', {
      description: 'A embarcação foi excluída com sucesso.',
    });
    controller.expectOne('/api/vessels?customerId=c1&page=1').flush({ vessels: [], total: 0 });
  });
});
