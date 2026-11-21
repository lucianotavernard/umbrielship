import { Component } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticateUser } from '../authenticate-user/authenticate-user';
import { authInterceptor } from '../../../shared/components/lib/auth.interceptor';

@Component({ template: '' })
class Dashboard {}

describe('AuthenticateUser', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'dashboard', component: Dashboard },
          { path: 'auth', component: Dashboard },
        ]),
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

  it('draws the mareos sign-in with the Umbrielship brand and nothing the app does not have', async () => {
    const element = await render();

    expect(element.querySelector('section')?.textContent).toContain('UMBRIELSHIP');
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Acesse sua conta');
    expect(element.textContent).toContain('BEM-VINDO DE VOLTA');
    expect(element.textContent).toContain('Fale com o administrador da sua organização.');
    expect(element.querySelector('aside')?.getAttribute('aria-label')).toBe('Operação marítima');
    expect(element.querySelector('aside h2')?.textContent?.trim()).toBe('O próximo passo da sua jornada começa aqui.');
    // The cover photo is a background behind the cover's copy, so it loads only where the cover shows.
    const cover = element.querySelector<HTMLElement>('aside [data-slot="cover-image"]')!;
    expect(cover.getAttribute('style')).toContain('mareos-login-cover.png');
    expect(cover.classList.contains('bg-cover')).toBe(true);
    expect(cover.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('aside img')).toBeNull();
    expect(element.textContent).not.toContain('MARÉ');
    expect(element.textContent).not.toContain('Esqueceu sua senha?');
    expect(element.textContent).not.toContain('Manter conectado');
    expect(element.querySelector('input[type="checkbox"]')).toBeNull();
  });

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
    expect(TestBed.inject(Router).url).toBe('/dashboard');
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
