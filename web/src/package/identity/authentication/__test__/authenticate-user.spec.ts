import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticateUser } from '../authenticate-user/authenticate-user';

@Component({ template: '' })
class Dashboard {}

describe('AuthenticateUser', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'dashboard', component: Dashboard }]),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  function fill(element: HTMLElement, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement>(selector);
    if (!field) throw new Error(`No field ${selector}`);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function render() {
    const fixture = TestBed.createComponent(AuthenticateUser);
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  it('[C84] stores the access token from a 201', async () => {
    const element = await render();
    fill(element, '#email', 'ops@atlantic.test');
    fill(element, '#password', 'secret-pass');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await settle();

    const request = controller.expectOne('/api/sessions');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'ops@atlantic.test',
      password: 'secret-pass',
    });
    request.flush({ access_token: 'tok-84' });
    await settle();

    expect(localStorage.getItem('@umbriel:access-token')).toBe('tok-84');
  });

  it('[C84] shows the Portuguese message on 401', async () => {
    const element = await render();
    fill(element, '#email', 'ops@atlantic.test');
    fill(element, '#password', 'secret-pass');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await settle();

    const request = controller.expectOne('/api/sessions');
    request.flush({ message: 'Wrong credentials' }, { status: 401, statusText: 'Unauthorized' });
    await settle();

    expect(element.textContent).toContain('E-mail ou senha incorretos.');
  });
});
