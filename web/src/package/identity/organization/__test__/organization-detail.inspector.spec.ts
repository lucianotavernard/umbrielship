import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationDetail } from '../organization-detail/organization-detail';

describe('OrganizationDetail with inspectors', () => {
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

  async function render() {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    controller.expectOne('/api/organizations/org-1').flush({
      organization: {
        id: 'org-1',
        name: 'Atlantic',
        email: 'ops@atlantic.test',
        isInternal: false,
      },
    });
    controller.expectOne('/api/organizations/org-1/users?page=1&per_page=20').flush({
      users: [{ id: 'user-ines', name: 'Ines', email: 'ines@atlantic.test', role: 'inspector' }],
      total: 1,
    });
    controller.expectOne('/api/organizations/org-1/roles').flush({
      roles: [
        { role: 'administrator', users: 0 },
        { role: 'operator', users: 0 },
        { role: 'inspector', users: 7 },
      ],
    });
    controller.expectOne('/api/organizations/org-1/invitations?page=1&per_page=20').flush({
      invitations: [],
      total: 0,
    });
    controller.expectOne('/api/users?not_in_organization=org-1&per_page=100').flush({
      users: [{ id: 'user-1', name: 'Ana', email: 'ana@atlantic.test' }],
      total: 1,
    });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  it('inspector C20 shows the Inspetor badge and no Role counts', async () => {
    const element = await render();

    const badges = [...element.querySelectorAll('t-badge')].map((badge) =>
      badge.textContent?.trim(),
    );
    expect(badges).toContain('Inspetor');
    expect(element.textContent).not.toContain('7');
  });

  it('inspector C19 the Invitation form offers Inspetor and sends role inspector', async () => {
    const element = await render();

    [...element.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Novo convite')
      ?.click();
    await settle();
    const options = [...element.querySelectorAll<HTMLOptionElement>('#invitation-role option')];
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Administrador',
      'Operador',
      'Inspetor',
    ]);

    fill(element, '#invitation-user', 'user-1');
    fill(element, '#invitation-role', 'inspector');
    element.querySelector<HTMLSelectElement>('#invitation-user')?.closest('form')?.requestSubmit();
    await settle();

    const sent = controller.expectOne('/api/invitations');
    expect(sent.request.body).toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'inspector',
    });
    sent.flush({
      id: 'inv-2',
      email: 'ana@atlantic.test',
      role: 'inspector',
      status: 'pending',
      deliveryStatus: 'queued',
    });
    await settle();
    controller
      .match(() => true)
      .forEach((request) => request.flush({ invitations: [], users: [], total: 0 }));
  });
});
