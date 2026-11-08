import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationList } from '../organization-list/organization-list';

describe('OrganizationList', () => {
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

  function fill(element: HTMLElement, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  it('[C87] renders the organization and posts the create body', async () => {
    const fixture = TestBed.createComponent(OrganizationList);
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=20').flush({
      organizations: [{ id: 'org-1', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false }],
      total: 1,
    });
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table')?.textContent).toContain('Atlantic');
    expect(element.textContent).toContain('ops@atlantic.test');

    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Nova Organização'))?.click();
    await settle();
    fill(element, '#organization-name', 'Atlantic');
    fill(element, '#organization-email', 'ops@atlantic.test');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await settle();

    const created = controller.expectOne('/api/organizations');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({ name: 'Atlantic', email: 'ops@atlantic.test' });
    created.flush({ id: 'org-2', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false });
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=20').flush({ organizations: [], total: 0 });
  });

  it('[C87] an empty list says Nenhuma organização encontrada', async () => {
    TestBed.createComponent(OrganizationList);
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=20').flush({ organizations: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Nenhuma organização encontrada');
  });
});
