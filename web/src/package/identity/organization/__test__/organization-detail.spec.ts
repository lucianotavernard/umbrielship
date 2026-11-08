import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationDetail } from '../organization-detail/organization-detail';

describe('OrganizationDetail', () => {
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

  function flushReads() {
    controller.expectOne('/api/organizations/org-1').flush({
      organization: { id: 'org-1', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false },
    });
    controller.expectOne('/api/organizations/org-1/users?page=1&per_page=20').flush({
      users: [{ id: 'user-ana', name: 'Ana', email: 'ana@atlantic.test', role: 'operator' }],
      total: 1,
    });
    controller.expectOne('/api/organizations/org-1/roles').flush({
      roles: [
        { role: 'administrator', users: 0 },
        { role: 'operator', users: 1 },
      ],
    });
    controller.expectOne('/api/organizations/org-1/invitations?page=1&per_page=20').flush({
      invitations: [
        {
          id: 'inv-1',
          email: 'ana@atlantic.test',
          role: 'operator',
          status: 'pending',
          deliveryStatus: 'failed',
        },
      ],
      total: 1,
    });
    controller.expectOne('/api/users?not_in_organization=org-1&per_page=100').flush({
      users: [{ id: 'user-1', name: 'Ana', email: 'ana@atlantic.test' }],
      total: 1,
    });
  }

  it('[C88] shows the user and the invitation and posts create, send and resend', async () => {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    flushReads();
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Ana');
    expect(element.textContent).toContain('ana@atlantic.test');
    expect(element.textContent).toContain('Operador');

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Reenviar')?.click();
    await settle();
    const resent = controller.expectOne('/api/invitations/inv-1/resend');
    expect(resent.request.method).toBe('POST');
    resent.flush({
      id: 'inv-1',
      email: 'ana@atlantic.test',
      role: 'operator',
      status: 'pending',
      deliveryStatus: 'queued',
    });
    await settle();
    controller.match(() => true).forEach((request) =>
      request.flush({
        invitations: [
          {
            id: 'inv-1',
            email: 'ana@atlantic.test',
            role: 'operator',
            status: 'pending',
            deliveryStatus: 'queued',
          },
        ],
        users: [],
        total: 1,
      }),
    );

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Novo usuário')?.click();
    await settle();
    fill(element, '#user-name', 'Ana');
    fill(element, '#user-email', 'ana@atlantic.test');
    fill(element, '#user-password', 'secret-pass');
    fill(element, '#user-role', 'operator');
    element.querySelector<HTMLButtonElement>('#user-name')?.closest('form')?.requestSubmit();
    await settle();
    const created = controller.expectOne('/api/users');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Ana',
      email: 'ana@atlantic.test',
      password: 'secret-pass',
      role: 'operator',
      organizationId: 'org-1',
    });
    created.flush({ id: 'user-ana', name: 'Ana', email: 'ana@atlantic.test', role: 'operator' });
    await settle();
    controller.match(() => true).forEach((request) => request.flush({ users: [], roles: [], total: 0 }));

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Novo convite')?.click();
    await settle();
    fill(element, '#invitation-user', 'user-1');
    fill(element, '#invitation-role', 'operator');
    element.querySelector<HTMLButtonElement>('#invitation-user')?.closest('form')?.requestSubmit();
    await settle();
    const sent = controller.expectOne('/api/invitations');
    expect(sent.request.method).toBe('POST');
    expect(sent.request.body).toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'operator',
    });
    sent.flush({ id: 'inv-2', email: 'ana@atlantic.test', role: 'operator', status: 'pending', deliveryStatus: 'queued' });
    await settle();
    controller.match(() => true).forEach((request) =>
      request.flush({ invitations: [], users: [], total: 0 }),
    );
  });
});
