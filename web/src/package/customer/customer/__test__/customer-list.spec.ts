import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CustomerList } from '../customer-list/customer-list';

describe('CustomerList', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
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

  it('[C90] requests page 1 then page 2 without organizationId', async () => {
    const fixture = TestBed.createComponent(CustomerList);
    await settle();
    const first = controller.expectOne('/api/customers?page=1');
    expect(first.request.url).not.toContain('organizationId');
    first.flush({
      customers: [{ id: 'c1', name: 'A', email: 'a@a.test', phone: null, address: { address: 'Rua', city: 'Santos', state: 'SP' } }],
      total: 11,
    });
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    [...element.querySelectorAll('a')].find((link) => link.textContent?.trim() === '2')?.click();
    await settle();
    const second = controller.expectOne('/api/customers?page=2');
    expect(second.request.url).not.toContain('organizationId');
    second.flush({ customers: [], total: 11 });
  });

  it('[C90] an empty list says Nenhum cliente encontrado', async () => {
    TestBed.createComponent(CustomerList);
    await settle();
    controller.expectOne('/api/customers?page=1').flush({ customers: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Nenhum cliente encontrado');
  });

  it('[C92] posts the customer body and requests the list again', async () => {
    const fixture = TestBed.createComponent(CustomerList);
    await settle();
    controller.expectOne('/api/customers?page=1').flush({ customers: [], total: 0 });
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Novo Cliente'))?.click();
    await settle();
    fill(element, '#name', 'Atlantic');
    fill(element, '#email', 'ops@atlantic.test');
    fill(element, '#phone', '11999999999');
    fill(element, '#address', 'Rua 1');
    fill(element, '#city', 'Santos');
    fill(element, '#state', 'SP');
    element.querySelector('#name')?.closest('form')?.requestSubmit();
    await settle();
    const created = controller.expectOne('/api/customers');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Atlantic',
      email: 'ops@atlantic.test',
      phone: '11999999999',
      address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
    });
    created.flush({ customer: { id: 'c1' } });
    await settle();
    controller.expectOne((request) => request.url.startsWith('/api/customers')).flush({ customers: [], total: 0 });
  });
});
